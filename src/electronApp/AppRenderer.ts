import { DataStorage } from "../bars/model/persisted/DataStorage";
import { JQueryUtils } from "../utils/JQueryUtils";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
import { ChocolateBarsArgs } from "../utils/SharedDataUtils";
import { KeyboardController } from "./controllers/KeyboardController";
import { DetailPaneRenderer } from "./rendering/DetailPaneRenderer";
import { ExpandedImageRenderer } from "./rendering/ExpandedImageRenderer";
import { HtmlGrid } from "./rendering/HtmlGrid";
import { ImagesRenderer } from "./rendering/ImagesRenderer";
import { MoveStarredImagesRenderer } from "./rendering/MovedStarredImagesRenderer";
import { PagerRenderer } from "./rendering/PagerRenderer";
import { RefreshImagesRenderer } from "./rendering/RefreshImagesRenderer";
import { SelectDirectoryRenderer } from "./rendering/SelectDirectoryRenderer";
import { State } from "./State";

const outputter = new ConsoleOutputter(Verbosity.High);

const grid = new HtmlGrid();

const state: State = {
    currentPage: 0,
    enableSubDirs: false,
    imageInputDir: "",
    epoch: 0,
    selectedImage: null
};

export namespace AppRenderer {
    export function onLoad() {
        KeyboardController.addKeyboardListener(state, renderImagesAndPagerForDirectorySamePage);

        periodicallySave();
    }

    // TODO should really save on quit - would need to send JSON back to server
    export function periodicallySave() {
        setInterval(() => {
            console.log("saving data...");
            DataStorage.saveForDirectorySync(state.imageInputDir);
        }, 5000);
    }

    export async function renderContainerAndDetailWithImages(args: ChocolateBarsArgs) {
        state.imageInputDir = args.imageInputDir;
        state.enableSubDirs = args.enableSubDirs;

        JQueryUtils.renderHtml(grid.getHeaderHtml());
        SelectDirectoryRenderer.addSelectDirectoryListener(renderImagesAndPagerForDirectory);
        MoveStarredImagesRenderer.addMoveOrCopyStarredListeners(
            state,
            renderImagesAndPagerForDirectorySamePage
        );
        RefreshImagesRenderer.addRefreshListener(state, renderImagesAndPagerForDirectorySamePage);

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
}
