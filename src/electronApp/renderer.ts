import * as jquery from "jquery";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { ChocolateBars } from "../bars/ChocolateBars";
import { ImageDetail } from "../bars/model/ImageDetail";
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

    for await (const result of ChocolateBars.processDirectoryIterable(imageInputDir, outputter)) {
        outputter.infoVerbose(`rendering ${result.imageDetails.length} images`);
        if (result.imageDetails.length > 0) {
            outputter.infoVerbose(`first = ${result.imageDetails[0].originalFilepath}`);
        }

        // TODO xxx display text results

        result.imageDetails.forEach(image => {
            grid.addImage(image);

            if (grid.isRowFull()) {
                renderHtml(grid.renderRow());
            }
        });

        if (grid.hasRow()) {
            renderHtml(grid.renderRow());
        }
    }
}

function renderHtml(html: string) {
    jquery(`#content`).prepend(html);
}

function addKeyboardListener() {
    const F12 = 123;
    const F5 = 116;
    const R_KEY = getAsciiOf("r");
    const R_KEY_CAPS = getAsciiOf("R");

    document.addEventListener("keydown", function(e) {
        if (e.which === F12) {
            remote.getCurrentWindow().webContents.toggleDevTools();
        } else if (e.which === F5 || (e.ctrlKey && (e.which === R_KEY || e.which === R_KEY_CAPS))) {
            location.reload();
        }
    });
}

function getAsciiOf(char: string) {
    return char.charCodeAt(0);
}
