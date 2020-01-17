import { JQueryUtils } from "../utils/JQueryUtils";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { Verbosity, verbosityAsText } from "../utils/outputter/Verbosity";
import { ChocolateBarsArgs } from "../utils/SharedDataUtils";
import { KeyboardController } from "./controllers/KeyboardController";
import { ClearStarredImagesRenderer } from "./rendering/ClearStarredImagesRenderer";
import { DetailPaneRenderer } from "./rendering/DetailPaneRenderer";
import { ExpandedImageRenderer } from "./rendering/ExpandedImageRenderer";
import { HtmlGrid } from "./rendering/HtmlGrid";
import { ImagesRenderer } from "./rendering/ImagesRenderer";
import { MoveStarredImagesRenderer } from "./rendering/MovedStarredImagesRenderer";
import { PagerRenderer } from "./rendering/PagerRenderer";
import { RefreshImagesRenderer } from "./rendering/RefreshImagesRenderer";
import { SelectDirectoryRenderer } from "./rendering/SelectDirectoryRenderer";
import { State } from "./State";

let outputter = new ConsoleOutputter(Verbosity.Low);

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
        KeyboardController.addKeyboardListener(
            state,
            outputter,
            renderImagesAndPagerForDirectorySamePage
        );
    }

    // TODO should really save on quit - would need to send JSON back to server

    export async function renderContainerAndDetailWithImages(args: ChocolateBarsArgs) {
        setVerbosity(args.isVerbose);

        state.imageInputDir = args.imageDir;
        state.enableSubDirs = args.subDirs;

        JQueryUtils.renderHtml(grid.getHeaderHtml());
        SelectDirectoryRenderer.addSelectDirectoryListener(renderImagesAndPagerForDirectory);
        MoveStarredImagesRenderer.addMoveOrCopyStarredListeners(
            state,
            outputter,
            renderImagesAndPagerForDirectorySamePage
        );
        ClearStarredImagesRenderer.addListener(state, renderImagesAndPagerForDirectorySamePage);
        RefreshImagesRenderer.addRefreshListener(state, renderImagesAndPagerForDirectorySamePage);

        JQueryUtils.renderHtml(grid.getImagesAndPagerContainerHtml());

        DetailPaneRenderer.renderDetailContainer();

        ExpandedImageRenderer.renderHiddenPopup();

        await renderImagesAndPager();
    }

    function setVerbosity(isVerbose: boolean) {
        const verbosity = isVerbose ? Verbosity.High : Verbosity.Low;

        outputter = new ConsoleOutputter(verbosity);
        outputter.info(`Verbosity = ${verbosityAsText(verbosity)}`);
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
