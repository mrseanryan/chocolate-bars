import * as jquery from "jquery";

import { ChocolateBars } from "../bars/ChocolateBars";
import { ImageFinder } from "../bars/files/ImageFinder";
import { ImageDetail } from "../bars/model/ImageDetail";
import { PagingModel } from "../bars/model/PagingModel";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { SharedDataUtils } from "../utils/SharedDataUtils";
import { DetailPaneRenderer } from "./rendering/DetailPaneRenderer";
import { ExpandedImageRenderer } from "./rendering/ExpandedImageRenderer";
import { HtmlGrid } from "./rendering/HtmlGrid";

const remote = require("electron").remote;

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const outputter = new ConsoleOutputter(Verbosity.High);

const grid = new HtmlGrid();

const HIDE_LOADING_AFTER_N_IMAGES = 9;

const state = {
    currentPage: 0,
    imageInputDir: "",
    // Each 'browse to directory' or 'select page' is a new epoch,
    // so can igore stale async responses. Alt could be to cancel promises but seems complicated.
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

async function renderContainerAndDetailWithImages(imageInputDir: string) {
    state.imageInputDir = imageInputDir;

    renderHtml(grid.getHeaderHtml());
    addSelectDirectoryListener();

    renderHtml(grid.getImagesAndPagerContainerHtml());

    renderDetailContainer();

    ExpandedImageRenderer.renderHiddenPopup();

    await renderImagesAndPager();
}

async function renderImagesAndPager() {
    renderPagerButtons();
    await renderImages();
}

async function renderPagerButtons() {
    let pageCount = 0;
    let imageCountThisPage = 0;
    grid.clearPagerContainer();

    // Always have a 1st page:
    renderPager(pageCount);
    pageCount++;

    const allImages = await ImageFinder.findImagesInDirectory(state.imageInputDir, outputter);
    allImages.forEach(() => {
        imageCountThisPage++;

        if (imageCountThisPage > PagingModel.IMAGES_PER_PAGE) {
            renderPager(pageCount);

            pageCount++;
            imageCountThisPage = 1;
        }
    });
}

async function renderImages() {
    grid.clearImagesContainer();
    DetailPaneRenderer.clear();
    clearImageHeader();

    showImagesLoading();

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
                hideImagesLoading();
            }
        });
    }

    hideImagesLoading();
}

function showImagesLoading() {
    renderHtml(getLoaderHtml(), grid.getImagesContainerId());
}

function hideImagesLoading() {
    jquery(`#${grid.getImagesContainerId()} .lds-ring`).hide();
}

function renderPager(pageId: number) {
    const isCurrent = pageId === state.currentPage;
    const disabled = isCurrent ? " disabled" : "";
    const currentClass = isCurrent ? " image-pager-button-current" : "";

    const pagerHtml = `<button id='button-pager-${pageId}}'${disabled} class="image-pager-button${currentClass}">${pageId +
        1}</button>`;
    jquery(".image-pager").append(pagerHtml);

    addPagerClickListener(pageId);
}

function addPagerClickListener(pageId: number) {
    const pageDiv = document.getElementById(`button-pager-${pageId}}`);
    if (!pageDiv) {
        outputter.error(`could not find page button div for '${pageId}'`);
        return;
    }

    pageDiv.addEventListener("click", () => onClickPager(pageId));
}

function onClickPager(pageId: number) {
    state.epoch++;

    state.currentPage = pageId;

    showImagesLoading();

    // use setTimeout to ensure loader appears
    setTimeout(() => {
        // a new pager button may become disabled - so also need to render the pager buttons.
        renderImagesAndPager();
    }, 250);
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

function renderDetailContainer() {
    const html =
        `<div class="container-vertical fullHeight">` +
        `<div id="detail-header"><div id="detail-header-text"/></div>` +
        `<div class="container detail-body">` +
        `<div class="image-histogram-container">${getLoaderHtml()}` +
        `<div id="image-histogram"/></div>` +
        `<div id="image-text" class="fullHeight"></div>` +
        `</div>` +
        `</div>`;

    renderHtml(html, "detail-panel");
}

function getLoaderHtml(): string {
    return `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
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

        if (e.key === "Escape") {
            ExpandedImageRenderer.onClickExpandedImagePopup();
        }
    });
}

function addSelectDirectoryListener() {
    const browseButton = document.getElementById("browseButton");

    if (!browseButton) {
        throw new Error("could not find the browse button");
    }

    browseButton.addEventListener("click", _ => {
        const directories = selectDirectory();

        if (directories && directories.length === 1) {
            state.epoch++;
            state.currentPage = 0;
            state.imageInputDir = directories[0];
            renderImagesAndPager();
        }
    });
}

function selectDirectory(): string[] {
    const mainWindow = remote.getCurrentWindow();

    return remote.dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"]
    });
}
