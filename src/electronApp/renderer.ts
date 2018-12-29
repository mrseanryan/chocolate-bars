import * as jquery from "jquery";

import { ChocolateBars } from "../bars/ChocolateBars";
import { ImageDetail } from "../bars/model/ImageDetail";
import { JQueryUtils } from "../utils/JQueryUtils";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { SharedDataUtils } from "../utils/SharedDataUtils";
import { DetailPaneRenderer } from "./rendering/DetailPaneRenderer";
import { ExpandedImageRenderer } from "./rendering/ExpandedImageRenderer";
import { HistogramRenderer } from "./rendering/HistogramRenderer";
import { HtmlGrid } from "./rendering/HtmlGrid";
import { LoaderRenderer } from "./rendering/LoaderRenderer";
import { PagerRenderer } from "./rendering/PagerRenderer";
import { SelectDirectoryRenderer } from "./rendering/SelectDirectoryRenderer";
import { State } from "./State";

const remote = require("electron").remote;

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const outputter = new ConsoleOutputter(Verbosity.High);

const grid = new HtmlGrid();

const HIDE_LOADING_AFTER_N_IMAGES = 9;

const state: State = {
    currentPage: 0,
    imageInputDir: "",
    epoch: 0
};

window.onload = () => {
    addKeyboardListener();

    const imageInputDir = SharedDataUtils.getArgs()[2];

    processDirectory(imageInputDir);
};

function processDirectory(imageInputDir: string) {
    setTimeout(() => {
        renderContainerAndDetailWithImages(imageInputDir);
    }, 0);
}

enum BorderStyle {
    None,
    Selected
}

// xxx  AppRenderer
async function renderContainerAndDetailWithImages(imageInputDir: string) {
    state.imageInputDir = imageInputDir;

    JQueryUtils.renderHtml(grid.getHeaderHtml());
    SelectDirectoryRenderer.addSelectDirectoryListener(renderImagesAndPagerForDirectory);

    JQueryUtils.renderHtml(grid.getImagesAndPagerContainerHtml());

    renderDetailContainer();

    ExpandedImageRenderer.renderHiddenPopup();

    await renderImagesAndPager();
}

async function renderImagesAndPager() {
    PagerRenderer.renderPagerButtons(state, outputter, renderImagesAndPager);
    await renderImages();
}

async function renderImagesAndPagerForDirectory(imageInputDir: string) {
    state.epoch++;
    state.currentPage = 0;
    state.imageInputDir = imageInputDir;

    renderImagesAndPager();
}

// xxx ImagesRenderer
async function renderImages() {
    grid.clearImagesContainer();
    DetailPaneRenderer.clear();
    clearImageHeader();

    LoaderRenderer.showImagesLoading();

    const imageInputDir = state.imageInputDir;
    grid.setTitleForDir(imageInputDir);

    let isFirst = true;
    let thisEpoch = state.epoch;
    let imagesLoaded = 0;

    for await (const result of ChocolateBars.processDirectoryIterable(
        imageInputDir,
        outputter,
        state.currentPage
    )) {
        if (thisEpoch !== state.epoch) {
            // a stale response
            return;
        }

        outputter.infoVerbose(`rendering ${result.imageDetails.length} images`);
        if (result.imageDetails.length > 0) {
            outputter.infoVerbose(`first = ${result.imageDetails[0].originalFilepath}`);
        }

        result.imageDetails.forEach(image => {
            grid.addImageToContainer(image);

            addImageClickListener(image);

            if (isFirst) {
                onClickImage(image);
                isFirst = false;
            }

            imagesLoaded++;
            if (imagesLoaded > HIDE_LOADING_AFTER_N_IMAGES) {
                LoaderRenderer.hideImagesLoading();
            }
        });
    }

    if (thisEpoch !== state.epoch) {
        // a stale response
        return;
    }

    LoaderRenderer.hideImagesLoading();

    if (imagesLoaded === 0) {
        renderForNoImages();
    }
}

function renderForNoImages() {
    grid.renderForNoImages();

    HistogramRenderer.renderHistogramForNoImages();
}

function addImageClickListener(image: ImageDetail) {
    const imageDivId = HtmlGrid.getImageDivId(image);

    const imageDiv = document.getElementById(imageDivId);
    if (!imageDiv) {
        outputter.error(`could not find image div '${imageDivId}'`);
        return;
    }

    imageDiv.addEventListener("click", () => onClickImage(image));

    addImageExpandClickListener(image);
    addImageNewWindowClickListener(image);
}

function addImageExpandClickListener(image: ImageDetail) {
    const imageExpandDivId = HtmlGrid.getImageExpandDivId(image);

    const imageExpandDiv = document.getElementById(imageExpandDivId);
    if (!imageExpandDiv) {
        outputter.error(`could not find image expand div '${imageExpandDivId}'`);
        return;
    }

    imageExpandDiv.addEventListener("click", () => ExpandedImageRenderer.onClickExpandImage(image));
}

function addImageNewWindowClickListener(image: ImageDetail) {
    const imageNewWindowDivId = HtmlGrid.getImageOpenNewWindowDivId(image);

    const imageNewWindowDiv = document.getElementById(imageNewWindowDivId);
    if (!imageNewWindowDiv) {
        outputter.error(`could not find image new window div '${imageNewWindowDivId}'`);
        return;
    }

    imageNewWindowDiv.addEventListener("click", () => onClickOpenImageInNewWindow(image));
}

let previousImageSelected: ImageDetail | null = null;

function onClickImage(image: ImageDetail) {
    setImageHeader(image);
    HistogramRenderer.setHistogramAsLoading();

    if (previousImageSelected) {
        setImageBorder(previousImageSelected, BorderStyle.None);
    }
    setImageBorder(image, BorderStyle.Selected);
    previousImageSelected = image;

    DetailPaneRenderer.renderDetailForImage(image, outputter);
}

function setImageHeader(image: ImageDetail) {
    jquery("#detail-header-text").text("image: " + image.filename);
}

function clearImageHeader() {
    jquery("#detail-header-text").text("");
}

function onClickOpenImageInNewWindow(image: ImageDetail) {
    window.open(`file://${image.originalFilepath}`, "_blank", "nodeIntegration=no");
}

function setImageBorder(image: ImageDetail, style: BorderStyle) {
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

// xx DetailPaneRenderer
function renderDetailContainer() {
    const html =
        `<div class="container-vertical fullHeight">` +
        `<div id="detail-header"><div id="detail-header-text"/></div>` +
        `<div class="container detail-body">` +
        `<div class="${HistogramRenderer.getHistogramContainerClass()}">${LoaderRenderer.getLoaderHtml()}` +
        `<div id="${HistogramRenderer.getHistogramContainerId()}"/></div>` +
        `<div id="image-text" class="fullHeight"></div>` +
        `</div>` +
        `</div>`;

    JQueryUtils.renderHtml(html, "detail-panel");
}

function addKeyboardListener() {
    document.addEventListener("keydown", function(e) {
        if (e.key === "F12") {
            remote.getCurrentWindow().webContents.toggleDevTools();
        } else if (e.key === "F5" || (e.ctrlKey && (e.key === "R" || e.key === "r"))) {
            location.reload();
        }

        if (e.key === "Escape") {
            ExpandedImageRenderer.onClickExpandedImagePopup();
        }
    });
}
