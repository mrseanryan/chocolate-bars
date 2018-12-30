const remote = require("electron").remote;

export namespace PrompterDialog {
    // Returns the index of the selected choice
    export async function prompt(
        choices: string[],
        title: string,
        message: string
    ): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const mainWindow = remote.getCurrentWindow();

                remote.dialog.showMessageBox(
                    mainWindow,
                    {
                        buttons: choices,
                        title: title,
                        message: message,
                        // Avoid ugly wide buttons:
                        noLink: true
                    },
                    (indexOfButtonSelected: number) => {
                        resolve(indexOfButtonSelected);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}
