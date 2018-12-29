const remote = require("electron").remote;

export namespace DirectorySelector {
    export function selectDirectory(): string[] {
        const mainWindow = remote.getCurrentWindow();

        return remote.dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"]
        });
    }
}
