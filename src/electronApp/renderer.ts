import * as jquery from "jquery";

import { ChocolateBars } from "../bars/ChocolateBars";
import { ImageFinder } from "../bars/files/ImageFinder";
import { ImageDetail } from "../bars/model/ImageDetail";
import { PagingModel } from "../bars/model/PagingModel";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { SharedDataUtils } from "../utils/SharedDataUtils";
import { DetailPaneRenderer } from "./rendering/DetailPaneRenderer";
import { HtmlGrid } from "./rendering/HtmlGrid";

const remote = require("electron").remote;

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const outputter = new ConsoleOutputter(Verbosity.High);

const grid = new HtmlGrid();

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

    renderHtml(grid.getImagesAndPagerContainerHtml());

    renderDetailContainer();

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

    const imageInputDir = state.imageInputDir;
    grid.setTitleForDir(imageInputDir);

    // TODO xxx split out the button from the title - then can listen earlier
    addSelectDirectoryListener();

    let isFirst = true;
    let thisEpoch = state.epoch;

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
        });
    }
}

function renderPager(pageId: number) {
    const disabled = pageId === state.currentPage ? " disabled" : "";

    const pagerHtml = `<button id='button-pager-${pageId}}'${disabled}>${pageId + 1}</button>`;
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

    // a new pager button may become disabled
    renderImagesAndPager();
}

function addImageClickListener(image: ImageDetail) {
    const imageDivId = HtmlGrid.getImageDivId(image);

    const imageDiv = document.getElementById(imageDivId);
    if (!imageDiv) {
        outputter.error(`could not find image div '${imageDivId}'`);
        return;
    }

    imageDiv.addEventListener("click", () => onClickImage(image));
}

let previousImageSelected: ImageDetail | null = null;

function onClickImage(image: ImageDetail) {
    jquery("#detail-header").text("image: " + image.filename);

    if (previousImageSelected) {
        setImageBorder(previousImageSelected, BorderStyle.None);
    }
    setImageBorder(image, BorderStyle.Selected);
    previousImageSelected = image;

    DetailPaneRenderer.renderDetailForImage(image, outputter);
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
        `<div class="container-vertical fullHeight"><div id="detail-header"></div>` +
        `<div class="container detail-body">` +
        `<div class="image-histogram-container">${renderLoaderHtml()}` +
        `<div id="image-histogram"/></div>` +
        `<div id="image-text" class="fullHeight"></div>` +
        `</div>` +
        `</div>`;

    renderHtml(html, "detail-panel");
}

function renderLoaderHtml(): string {
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
