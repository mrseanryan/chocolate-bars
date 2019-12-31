const remote = require("electron").remote;

export namespace DirectorySelectorDialog {
    export function selectImagesDirectory(title: string, buttonLabel: string): string[] {
        const mainWindow = remote.getCurrentWindow();

        return (
            remote.dialog.showOpenDialog(mainWindow, {
                title: title,
                buttonLabel: buttonLabel,
                properties: ["openDirectory"]
            }) || []
        );
    }
}
