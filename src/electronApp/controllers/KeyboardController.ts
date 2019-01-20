import { ImageDetail } from "../../bars/model/ImageDetail";
import { IOutputter } from "../../utils/outputter/IOutputter";
import { DeleteImageRenderer } from "../rendering/DeleteImageRenderer";
import { ExpandedImageRenderer } from "../rendering/ExpandedImageRenderer";
import { ImageStarRenderer } from "../rendering/ImageStarRenderer";
import { State } from "../State";

const remote = require("electron").remote;

export namespace KeyboardController {
    export function addKeyboardListener(
        state: State,
        outputter: IOutputter,
        renderImagesAndPagerForDirectorySamePage: (imageInputDir: string) => void
    ) {
        document.addEventListener("keydown", function(e) {
            if (e.key === "F12") {
                remote.getCurrentWindow().webContents.toggleDevTools();
            } else if (e.key === "F5" || (e.ctrlKey && (e.key === "R" || e.key === "r"))) {
                location.reload();
            }

            switch (e.key) {
                case "Delete": {
                    if (ExpandedImageRenderer.isOpen()) {
                        promptToDelete(
                            ExpandedImageRenderer.getCurrentImage(),
                            state,
                            renderImagesAndPagerForDirectorySamePage
                        );
                    }
                    break;
                }
                case "Escape": {
                    if (ExpandedImageRenderer.isOpen()) {
                        ExpandedImageRenderer.hideExpandedImage();
                    }
                    break;
                }
                case "ArrowLeft": {
                    if (ExpandedImageRenderer.isOpen()) {
                        ExpandedImageRenderer.goToPreviousImage(outputter);
                    }
                    break;
                }
                case "ArrowRight": {
                    if (ExpandedImageRenderer.isOpen()) {
                        ExpandedImageRenderer.goToNextImage(outputter);
                    }
                    break;
                }
                case "+": {
                    if (ExpandedImageRenderer.isOpen()) {
                        ExpandedImageRenderer.hideExpandedImage();
                    } else if (!ExpandedImageRenderer.isOpen() && state.selectedImage) {
                        ExpandedImageRenderer.onClickExpandImage(state.selectedImage, outputter);
                    }
                    break;
                }
                case "*": {
                    toggleStarredImage(state);
                    break;
                }
                // note: space is taken by Chrome = page down scrollbar
                case "Enter": {
                    toggleStarredImage(state);
                    break;
                }
                default:
                // do nothing
            }
        });
    }

    function promptToDelete(
        image: ImageDetail | null,
        state: State,
        renderImagesAndPagerForDirectorySamePage: (imageInputDir: string) => void
    ) {
        if (!image) {
            return;
        }

        const afterDelete = () => {
            // Simplest to hide the expanded view
            ExpandedImageRenderer.hideExpandedImage();

            // refresh the current directory
            renderImagesAndPagerForDirectorySamePage(state.imageInputDir);
        };

        DeleteImageRenderer.renderPrompt(image, afterDelete);
    }

    function toggleStarredImage(state: State) {
        if (ExpandedImageRenderer.isOpen()) {
            ExpandedImageRenderer.toggleStarredImage();
        } else {
            if (state.selectedImage) {
                ImageStarRenderer.toggleStarForImage(state.selectedImage);
            }
        }
    }
}
