import * as jquery from "jquery";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { ChocolateBars } from "../bars/ChocolateBars";
import { IOutputter } from "../utils/outputter/IOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { HtmlGrid } from "./HtmlGrid";
import { ImageDetail } from "../bars/model/ImageDetail";
import { HistogramReader, HistogramData } from "../bars/files/HistogramReader";
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

enum BorderStyle {
    None,
    Selected
}

async function renderImages(imageInputDir: string, outputter: IOutputter) {
    const grid = new HtmlGrid();

    renderHtml(grid.getHeaderHtml(imageInputDir));

    const images: ImageDetail[] = [];

    for await (const result of ChocolateBars.processDirectoryIterable(imageInputDir, outputter)) {
        outputter.infoVerbose(`rendering ${result.imageDetails.length} images`);
        if (result.imageDetails.length > 0) {
            outputter.infoVerbose(`first = ${result.imageDetails[0].originalFilepath}`);
        }

        // TODO xxx display text results

        result.imageDetails.forEach(image => {
            grid.addImage(image);
            images.push(image);

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

    addImageClickListeners(images, outputter);
}

function addImageClickListeners(images: ImageDetail[], outputter: IOutputter) {
    images.forEach(image => {
        const imageDivId = HtmlGrid.getImageDivId(image);

        const imageDiv = document.getElementById(imageDivId);
        if (!imageDiv) {
            outputter.error(`could not find image div '${imageDivId}'`);
            return;
        }

        imageDiv.addEventListener("click", () => onClickImage(image, outputter));
    });
}

let previousImageSelected: ImageDetail | null = null;

function onClickImage(image: ImageDetail, outputter: IOutputter) {
    jquery("#detail-header").text("image: " + image.filename);

    if (previousImageSelected) {
        setImageBorder(previousImageSelected, BorderStyle.None, outputter);
    }
    setImageBorder(image, BorderStyle.Selected, outputter);
    previousImageSelected = image;

    renderHistogramForImage(image, outputter);
}

function setImageBorder(image: ImageDetail, style: BorderStyle, outputter: IOutputter) {
    let cssStyle: any = null;

    switch (style) {
        case BorderStyle.Selected:
            cssStyle = {
                "border-color": "#00FF00",
                "border-width": "1px",
                "border-style": "solid"
            };
            break;
        default:
            outputter.error(`Unknown BorderStyle '${style}' - defaulting to None`);
        case BorderStyle.None:
            cssStyle = {
                "border-style": "none"
            };
            break;
    }

    jquery(`#${HtmlGrid.getImageDivId(image)}`).css(cssStyle);
}

function renderDetailContainer() {
    const html = `<div class="container-vertical"><div id="detail-header">[Please select an image!]</div><div id="image-histogram"></div></div>`;

    renderHtml(html, "detail-panel");
}

declare namespace Plotly {
    function newPlot(divId: string, data: any, layout?: any): void;
}

// TODO xxx extract to HistogramRenderer
// TODO optimise - run histogram as web worker?
async function renderHistogramForImage(image: ImageDetail, outputter: IOutputter) {
    jquery("#image-histogram")
        .children()
        .remove();

    // TODO [perf] react + mobx could allow rendering to go ahead w/o histogram
    const histogram = await HistogramReader.getHistogramData(image.smallerFilepath, outputter);

    const range0to255: number[] = [];
    for (let i = 0; i < 256; i++) {
        range0to255.push(i);
    }

    const greys = calculateGreysFromHistogram(histogram);

    const trace = {
        x: range0to255,
        y: greys,
        // ref: https://plot.ly/javascript/histograms/#colored-and-styled-histograms
        marker: {
            // ref: https://www.rapidtables.com/web/color/brown-color.html
            color: "rgb(139,69,19)",
            line: {
                color: "rgb(210,105,30)",
                width: 1
            }
        },
        opacity: 0.75,
        type: "bar"
    };
    const data = [trace];

    var layout = {
        autosize: false,
        bargap: 0.1,
        bargroupgap: 0.1,
        barmode: "overlay",
        width: 750,
        height: 250,
        margin: {
            l: 25,
            r: 25,
            b: 25,
            t: 25,
            pad: 4
        },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#c7c7c7",
        xaxis: {
            fixedrange: true
        },
        yaxis: {
            fixedrange: true
        }
    };

    Plotly.newPlot("image-histogram", data, layout);
}

// Calculate greys as average of R, G, B
function calculateGreysFromHistogram(histogram: HistogramData): number[] {
    if (histogram.greyscale) {
        return histogram.red;
    }

    const greys: number[] = [];
    for (let r = 0; r < histogram.red.length; r++) {
        const total = histogram.red[r] + histogram.green[r] + histogram.blue[r];

        const average = total / 3;

        greys.push(average);
    }

    return greys;
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
