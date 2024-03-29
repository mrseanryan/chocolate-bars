import { app, BrowserWindow } from "electron";
import * as path from "path";

import { ArgsParser } from "../utils/ArgsParser";
import { ChocolateBarsArgs } from "../utils/SharedDataUtils";

let mainWindow: Electron.BrowserWindow | null = null;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, "./chocolate-bar-straightened-trans.png"),
        webPreferences: {
            nodeIntegration: true
        },
        // Resuling min values are bigger!
        minWidth: 680, // = 835 on Windows 10
        minHeight: 600, // = 718 on Windows 10
        width: 1000,
        height: 600
    });

    mainWindow.setMenu(null);

    // Load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "./index.html"));

    const args = ArgsParser.parse();

    const chocolateArgs: ChocolateBarsArgs = {
        ...args,
        thisScriptDir: process.argv[1]
    };

    (global as any)["sharedObject"] = chocolateArgs;

    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// hide toolbar, even on new windows:
app.on("browser-window-created", function(e, window) {
    window.setMenu(null);
});

app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
