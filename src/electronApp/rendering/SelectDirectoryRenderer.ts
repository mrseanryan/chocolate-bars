const remote = require("electron").remote;

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
            const directories = selectDirectory();

            if (directories && directories.length === 1) {
                renderImagesAndPagerForDirectory(directories[0]);
            }
        });
    }

    function selectDirectory(): string[] {
        const mainWindow = remote.getCurrentWindow();

        return remote.dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"]
        });
    }
}
