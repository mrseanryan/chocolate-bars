import * as fs from "fs";
import * as path from "path";

import { State } from "../State";

export namespace RefreshImagesRenderer {
    export function getButtonHtml(): string {
        return `<button id="refreshButton" class="toolbarButton">Refresh</button>`;
    }

    export function addRefreshListener(
        state: State,
        renderImagesAndPagerForDirectorySamePage: (imageInputDir: string) => void
    ) {
        const refreshButton = document.getElementById("refreshButton");

        if (!refreshButton) {
            throw new Error("could not find the 'refresh' button");
        }

        refreshButton.addEventListener("click", _ => {
            // refresh the current directory:
            renderImagesAndPagerForDirectorySamePage(state.imageInputDir);
        });
    }
}
