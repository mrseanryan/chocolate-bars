import { DirectorySelectorDialog } from "../../utils/DirectorySelectorDialog";
import { ImageMover, MoveOrCopy, MoveOrCopyUtils } from "../../utils/ImageMover";
import { IOutputter } from "../../utils/outputter/IOutputter";
import { State } from "../State";
import { ConfirmationDialog } from "./ConfirmationDialog";

type ButtonConfig = {
    mode: MoveOrCopy;
    buttonId: string;
    dialog: {
        title: string;
        buttonText: string;
    };
};

export namespace MoveStarredImagesRenderer {
    export function getButtonHtml(): string {
        return (
            `<button id="copyStarredButton" class="toolbarButton">Copy *...</button>` +
            `<button id="moveStarredButton" class="toolbarButton">Move *...</button>`
        );
    }

    export function addMoveOrCopyStarredListeners(
        state: State,
        outputter: IOutputter,
        renderImagesAndPagerForDirectorySamePage: (imageInputDir: string) => void
    ) {
        const buttons: ButtonConfig[] = [
            {
                mode: MoveOrCopy.Copy,
                buttonId: "copyStarredButton",
                dialog: {
                    title: "Copy starred images to directory",
                    buttonText: "Copy images"
                }
            },
            {
                mode: MoveOrCopy.Move,
                buttonId: "moveStarredButton",
                dialog: {
                    title: "Move starred images to directory",
                    buttonText: "Move images"
                }
            }
        ];

        buttons.forEach(button => {
            addMoveOrCopyStarredListener(
                state,
                renderImagesAndPagerForDirectorySamePage,
                button,
                outputter
            );
        });
    }

    function addMoveOrCopyStarredListener(
        state: State,
        renderImagesAndPagerForDirectorySamePage: (imageInputDir: string) => void,
        buttonConfig: ButtonConfig,
        outputter: IOutputter
    ) {
        const button = document.getElementById(buttonConfig.buttonId);

        if (!button) {
            throw new Error(`Could not find the button with id '${buttonConfig.buttonId}'`);
        }

        button.addEventListener("click", _ => {
            ImageMover.hasStarredImagesThisPage(state.imageInputDir, state, outputter).then(
                hasStars => {
                    if (!hasStars) {
                        showConfirmation(
                            buttonConfig.mode,
                            "Please first add stars to some images.",
                            () => {
                                return;
                            }
                        );
                        return;
                    } else {
                        handleMoveOrCopyImages(
                            state,
                            renderImagesAndPagerForDirectorySamePage,
                            buttonConfig,
                            outputter
                        );
                    }
                }
            );
        });
    }

    function showConfirmation(mode: MoveOrCopy, message: string, action: () => void) {
        ConfirmationDialog.show(
            `${MoveOrCopyUtils.toTextCapitalized(mode)} images`,
            message,
            action
        );
    }

    function handleMoveOrCopyImages(
        state: State,
        renderImagesAndPagerForDirectorySamePage: (imageInputDir: string) => void,
        buttonConfig: ButtonConfig,
        outputter: IOutputter
    ) {
        const directories = DirectorySelectorDialog.selectImagesDirectory(
            buttonConfig.dialog.title,
            buttonConfig.dialog.buttonText
        );

        const imageInputDir = state.imageInputDir;

        if (directories && directories.length === 1) {
            ImageMover.moveStarredImagesTo(
                imageInputDir,
                directories[0],
                buttonConfig.mode,
                state,
                outputter
            )
                .then(() => {
                    showConfirmation(
                        buttonConfig.mode,
                        `Images were ${MoveOrCopyUtils.toTextPastTense(buttonConfig.mode)}.`,
                        () => {
                            // refresh the current directory:
                            renderImagesAndPagerForDirectorySamePage(imageInputDir);
                        }
                    );
                })
                .catch((err: any) => {
                    console.error(err);

                    showConfirmation(
                        buttonConfig.mode,
                        `Some images could not be ${MoveOrCopyUtils.toTextPastTense(
                            buttonConfig.mode
                        )}. ${err}`,
                        () => {
                            // some files may have moved OK - so refresh the current directory:
                            renderImagesAndPagerForDirectorySamePage(imageInputDir);
                        }
                    );
                });
        }
    }
}
