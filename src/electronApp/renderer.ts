import * as jquery from "jquery";

import { ChocolateBars } from "../bars/ChocolateBars";
import { ImageDetail } from "../bars/model/ImageDetail";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { IOutputter } from "../utils/outputter/IOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { SharedDataUtils } from "../utils/SharedDataUtils";
import { DetailPaneRenderer } from "./rendering/DetailPaneRenderer";
import { HtmlGrid } from "./rendering/HtmlGrid";

const remote = require("electron").remote;

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.onload = () => {
    addKeyboardListener();

    const imageInputDir = SharedDataUtils.getArgs()[2];

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

    DetailPaneRenderer.renderDetailForImage(image, outputter);
}

function setImageBorder(image: ImageDetail, style: BorderStyle, outputter: IOutputter) {
    const jqueryDiv = jquery(`#${HtmlGrid.getImageDivId(image)}`);

    const selectedClass = "user-image-selected";
    const notSelectedClass = "user-image-not-selected";

    switch (style) {
        case BorderStyle.Selected:
            jqueryDiv.addClass(selectedClass);
            jqueryDiv.removeClass(notSelectedClass);
            break;
        case BorderStyle.None:
            jqueryDiv.addClass(notSelectedClass);
            jqueryDiv.removeClass(selectedClass);
            break;
        default:
            outputter.error(`Unknown BorderStyle '${style}' - defaulting to None`);
            jqueryDiv.removeClass(selectedClass);
    }
}

function renderDetailContainer() {
    const html =
        `<div class="container-vertical fullHeight"><div id="detail-header">[Please select an image!]</div>` +
        `<div class="container detail-body">` +
        `<div id="image-histogram"></div><div id="image-text" class="fullHeight"></div>` +
        `</div>` +
        `</div>`;

    renderHtml(html, "detail-panel");
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
