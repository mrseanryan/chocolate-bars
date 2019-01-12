import { DataStorage } from "../../bars/model/persisted/DataStorage";
import { State } from "../State";
import { Prompter } from "./Prompter";

export namespace ClearStarredImagesRenderer {
    export function getButtonHtml(): string {
        return `<button id="clearStarredButton" class="toolbarButton">Clear *...</button>`;
    }

    export function addListener(
        state: State,
        renderImagesAndPagerForDirectorySamePage: (imageInputDir: string) => void
    ) {
        const button = document.getElementById("clearStarredButton");

        if (!button) {
            throw new Error(`Could not find the button with id 'clearStarredButton'`);
        }

        const refreshAfterDelay = () => {
            setTimeout(() => {
                // refresh the current directory:
                renderImagesAndPagerForDirectorySamePage(state.imageInputDir);
            }, 250);
        };

        button.addEventListener("click", _ => {
            Prompter.prompt(
                "Clear Stars from Images",
                "Clear Stars",
                "Do you want to clear all the stars from images in this folder? (cannot be undone)",
                () => {
                    DataStorage.clearStarsAndSave()
                        .then(() => {
                            refreshAfterDelay();
                        })
                        .catch(error => {
                            console.error(error);
                            refreshAfterDelay();
                        });
                }
            );
        });
    }
}
