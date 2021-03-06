import { DirectorySelectorDialog } from "../../utils/DirectorySelectorDialog";

export namespace SelectDirectoryRenderer {
    export function getBrowseButtonHtml(): string {
        return `<button id="browseButton" class="toolbarButton">Browse...</button>`;
    }

    export function addSelectDirectoryListener(
        renderImagesAndPagerForDirectory: (imageInputDir: string) => void
    ) {
        const browseButton = document.getElementById("browseButton");

        if (!browseButton) {
            throw new Error("could not find the browse button");
        }

        browseButton.addEventListener("click", _ => {
            const directories = DirectorySelectorDialog.selectImagesDirectory(
                "Select a directory to view",
                "Select Directory"
            );

            if (directories && directories.length === 1) {
                renderImagesAndPagerForDirectory(directories[0]);
            }
        });
    }
}
