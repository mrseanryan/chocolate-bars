import * as jquery from "jquery";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { ChocolateBars } from "../bars/ChocolateBars";
import { IOutputter } from "../utils/outputter/IOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { HtmlGrid } from "./HtmlGrid";
import { ImageDetail } from "../bars/model/ImageDetail";
import { HistogramReader } from "../bars/files/HistogramReader";
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

    let lastImage: ImageDetail | null = null;

    for await (const result of ChocolateBars.processDirectoryIterable(imageInputDir, outputter)) {
        outputter.infoVerbose(`rendering ${result.imageDetails.length} images`);
        if (result.imageDetails.length > 0) {
            outputter.infoVerbose(`first = ${result.imageDetails[0].originalFilepath}`);
        }

        // TODO xxx display text results

        result.imageDetails.forEach(image => {
            grid.addImage(image);
            lastImage = image;

            if (grid.isRowFull()) {
                renderHtml(grid.getRowHtml());
                grid.clearRow();
            }
        });
    }

    if (grid.hasRow()) {
        renderHtml(grid.getRowHtml());
        grid.clearRow();
    }

    renderDetailContainer();

    if (lastImage) {
        // NOT waiting
        renderHistogramForImage(lastImage, outputter);
    }
}

function renderDetailContainer() {
    const html = `<div id="image-histogram"></div>`;

    renderHtml(html, "detail-panel");
}

declare namespace Plotly {
    function newPlot(divId: string, data: any, layout?: any): void;
}

async function renderHistogramForImage(image: ImageDetail, outputter: IOutputter) {
    // TODO [perf] react + mobx could allow rendering to go ahead w/o histogram
    const histogram = await HistogramReader.getHistogramData(image.smallerFilepath, outputter);

    const x = [];
    for (var i = 0; i < 500; i++) {
        x[i] = Math.random();
    }

    const trace = {
        x: x,
        type: "histogram"
    };
    const data = [trace];

    // TODO xxx get avg of RGB

    var layout = {
        autosize: false,
        width: 250,
        height: 250,
        margin: {
            l: 25,
            r: 25,
            b: 25,
            t: 25,
            pad: 4
        },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#c7c7c7"
    };

    Plotly.newPlot("image-histogram", data, layout);
}

function renderHtml(html: string, containerId: string = "content") {
    jquery(`#${containerId}`).append(html);
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
