import { JQueryUtils } from "../utils/JQueryUtils";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { DetailPaneRenderer } from "./rendering/DetailPaneRenderer";
import { ExpandedImageRenderer } from "./rendering/ExpandedImageRenderer";
import { HtmlGrid } from "./rendering/HtmlGrid";
import { ImagesRenderer } from "./rendering/ImagesRenderer";
import { PagerRenderer } from "./rendering/PagerRenderer";
import { SelectDirectoryRenderer } from "./rendering/SelectDirectoryRenderer";
import { State } from "./State";

const remote = require("electron").remote;

const outputter = new ConsoleOutputter(Verbosity.High);

const grid = new HtmlGrid();

const state: State = {
    currentPage: 0,
    imageInputDir: "",
    epoch: 0
};

export namespace AppRenderer {
    export function onload() {
        addKeyboardListener();
    }

    export async function renderContainerAndDetailWithImages(imageInputDir: string) {
        state.imageInputDir = imageInputDir;

        JQueryUtils.renderHtml(grid.getHeaderHtml());
        SelectDirectoryRenderer.addSelectDirectoryListener(renderImagesAndPagerForDirectory);

        JQueryUtils.renderHtml(grid.getImagesAndPagerContainerHtml());

        DetailPaneRenderer.renderDetailContainer();

        ExpandedImageRenderer.renderHiddenPopup();

        await renderImagesAndPager();
    }

    async function renderImagesAndPager() {
        PagerRenderer.renderPagerButtons(state, outputter, renderImagesAndPager);
        await ImagesRenderer.renderImages(grid, state, outputter);
    }

    async function renderImagesAndPagerForDirectory(imageInputDir: string) {
        state.epoch++;
        state.currentPage = 0;
        state.imageInputDir = imageInputDir;

        renderImagesAndPager();
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
}
