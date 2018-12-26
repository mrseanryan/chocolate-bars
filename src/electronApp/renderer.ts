import * as jquery from "jquery";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { ChocolateBars } from "../bars/ChocolateBars";
import { IOutputter } from "../utils/outputter/IOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { HtmlGrid } from "./HtmlGrid";
const remote = require("electron").remote;

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.onload = () => {
    addKeyboardListener();

    const args = remote.getGlobal("sharedObject").prop1;

    const imageInputDir = args[2];

    const outputter = new ConsoleOutputter(Verbosity.High);

    setTimeout(() => {
        renderImages(imageInputDir, outputter);
    }, 0);
};

async function renderImages(imageInputDir: string, outputter: IOutputter) {
    const grid = new HtmlGrid();

    renderHtml(grid.getHeaderHtml(imageInputDir));

    for await (const result of ChocolateBars.processDirectoryIterable(imageInputDir, outputter)) {
        outputter.infoVerbose(`rendering ${result.imageDetails.length} images`);
        if (result.imageDetails.length > 0) {
            outputter.infoVerbose(`first = ${result.imageDetails[0].originalFilepath}`);
        }

        // TODO xxx display text results

        result.imageDetails.forEach(image => {
            grid.addImage(image);

            if (grid.isRowFull()) {
                renderHtml(grid.getRowHtml());
            }
        });
    }

    if (grid.hasRow()) {
        renderHtml(grid.getRowHtml());
    }
}

function renderHtml(html: string) {
    jquery(`#content`).append(html);
}

function addKeyboardListener() {
    document.addEventListener("keydown", function(e) {
        if (e.key === "F12") {
            remote.getCurrentWindow().webContents.toggleDevTools();
        } else if (e.key === "F5" || (e.ctrlKey && (e.key === "R" || e.key === "r"))) {
            location.reload();
        }
    });
}
