import { DirectorySelector } from "../../utils/DirectorySelector";

export namespace SelectDirectoryRenderer {
    export function getBrowseButtonHtml(): string {
        return `<button id="browseButton">Browse...</button>`;
    }

    export function addSelectDirectoryListener(
        renderImagesAndPagerForDirectory: (imageInputDir: string) => void
    ) {
        const browseButton = document.getElementById("browseButton");

        if (!browseButton) {
            throw new Error("could not find the browse button");
        }

        browseButton.addEventListener("click", _ => {
            const directories = DirectorySelector.selectImagesDirectory(
                "Select a directory to view",
                "Select Directory"
            );

            if (directories && directories.length === 1) {
                renderImagesAndPagerForDirectory(directories[0]);
            }
        });
    }
}
