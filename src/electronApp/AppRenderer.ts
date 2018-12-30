import { DataStorage } from "../bars/model/persisted/DataStorage";
import { JQueryUtils } from "../utils/JQueryUtils";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { DetailPaneRenderer } from "./rendering/DetailPaneRenderer";
import { ExpandedImageRenderer } from "./rendering/ExpandedImageRenderer";
import { HtmlGrid } from "./rendering/HtmlGrid";
import { ImagesRenderer } from "./rendering/ImagesRenderer";
import { MoveStarredImagesRenderer } from "./rendering/MovedStarredImagesRenderer";
import { PagerRenderer } from "./rendering/PagerRenderer";
import { SelectDirectoryRenderer } from "./rendering/SelectDirectoryRenderer";
import { State } from "./State";

const remote = require("electron").remote;

const outputter = new ConsoleOutputter(Verbosity.High);

const grid = new HtmlGrid();

const state: State = {
    currentPage: 0,
    imageInputDir: "",
    epoch: 0,
    selectedImage: null
};

export namespace AppRenderer {
    export function onLoad() {
        addKeyboardListener();

        periodicallySave();
    }

    // TODO should really save on quit - would need to send JSON back to server
    export function periodicallySave() {
        setInterval(() => {
            console.log("saving data...");
            DataStorage.saveForDirectorySync(state.imageInputDir);
        }, 5000);
    }

    export async function renderContainerAndDetailWithImages(imageInputDir: string) {
        state.imageInputDir = imageInputDir;

        JQueryUtils.renderHtml(grid.getHeaderHtml());
        SelectDirectoryRenderer.addSelectDirectoryListener(renderImagesAndPagerForDirectory);
        MoveStarredImagesRenderer.addMovedStarredListener(
            state,
            renderImagesAndPagerForDirectorySamePage
        );

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
        state.currentPage = 0;

        renderImagesAndPagerForDirectorySamePage(imageInputDir);
    }

    async function renderImagesAndPagerForDirectorySamePage(imageInputDir: string) {
        state.epoch++;
        state.imageInputDir = imageInputDir;
        state.selectedImage = null;

        renderImagesAndPager();
    }

    function addKeyboardListener() {
        document.addEventListener("keydown", function(e) {
            if (e.key === "F12") {
                remote.getCurrentWindow().webContents.toggleDevTools();
            } else if (e.key === "F5" || (e.ctrlKey && (e.key === "R" || e.key === "r"))) {
                location.reload();
            }

            switch (e.key) {
                case "Escape": {
                    if (ExpandedImageRenderer.isOpen()) {
                        ExpandedImageRenderer.hideExpandedImage();
                    }
                    break;
                }
                case "ArrowLeft": {
                    if (ExpandedImageRenderer.isOpen()) {
                        ExpandedImageRenderer.goToPreviousImage();
                    }
                    break;
                }
                case "ArrowRight": {
                    if (ExpandedImageRenderer.isOpen()) {
                        ExpandedImageRenderer.goToNextImage();
                    }
                    break;
                }
                case "+": {
                    if (ExpandedImageRenderer.isOpen()) {
                        ExpandedImageRenderer.hideExpandedImage();
                    } else if (!ExpandedImageRenderer.isOpen() && state.selectedImage) {
                        ExpandedImageRenderer.onClickExpandImage(state.selectedImage);
                    }
                    break;
                }
                case "*": {
                    toggleStarredImage();
                    break;
                }
                // note: space is taken by Chrome = page down scrollbar
                case "Enter": {
                    toggleStarredImage();
                    break;
                }
                default:
                // do nothing
            }
        });
    }

    function toggleStarredImage() {
        if (ExpandedImageRenderer.isOpen()) {
            ExpandedImageRenderer.toggleStarredImage();
        }
        // TODO xxx else toggle selectedImage
    }
}
