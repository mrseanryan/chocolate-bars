import * as jquery from "jquery";

import { ChocolateBars } from "../../bars/ChocolateBars";
import { ImageDetail } from "../../bars/model/ImageDetail";
import { DataStorage } from "../../bars/model/persisted/DataStorage";
import { IOutputter } from "../../utils/outputter/IOutputter";
import { State } from "../State";
import { DetailPaneRenderer } from "./DetailPaneRenderer";
import { ExpandedImageRenderer } from "./ExpandedImageRenderer";
import { HistogramRenderer } from "./HistogramRenderer";
import { HtmlGrid } from "./HtmlGrid";
import { ImageOrientationSetter } from "./ImageOrientationSetter";
import { ImageStarRenderer } from "./ImageStarRenderer";
import { LoaderRenderer } from "./LoaderRenderer";

const HIDE_LOADING_AFTER_N_IMAGES = 9;

enum BorderStyle {
    None,
    Selected
}

export namespace ImagesRenderer {
    export async function renderImages(grid: HtmlGrid, state: State, outputter: IOutputter) {
        LoaderRenderer.showImagesLoading();

        clearImages(grid);

        await DataStorage.loadForDirectoryOrCreate(state.imageInputDir);

        const imageInputDir = state.imageInputDir;
        grid.setTitleForDir(imageInputDir);

        let isFirst = true;
        let thisEpoch = state.epoch;
        let imagesLoaded = 0;

        for await (const result of ChocolateBars.processDirectoryIterable(
            imageInputDir,
            state.enableSubDirs,
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
                DataStorage.updateImageDetail(image);

                grid.addImageToContainer(image);

                ImageOrientationSetter.setOrientation(image);
                addImageClickListener(state, image, outputter);

                if (isFirst) {
                    onClickImage(state, image, outputter);
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
            renderForNoImages(grid);
        }
    }

    function clearImages(grid: HtmlGrid) {
        grid.clearImagesContainer();
        DetailPaneRenderer.clear();
        clearImageHeader();
        ExpandedImageRenderer.clearImages();
    }

    function clearImageHeader() {
        jquery("#detail-header-text").text("");
    }

    function renderForNoImages(grid: HtmlGrid) {
        grid.renderForNoImages();

        HistogramRenderer.renderHistogramForNoImages();
    }

    function addImageClickListener(state: State, image: ImageDetail, outputter: IOutputter) {
        const imageDivId = HtmlGrid.getImageDivId(image);

        const imageDiv = document.getElementById(imageDivId);
        if (!imageDiv) {
            outputter.error(`could not find image div '${imageDivId}'`);
            return;
        }

        imageDiv.addEventListener("click", () => onClickImage(state, image, outputter));

        addImageExpandClickListener(image, outputter);
        addImageNewWindowClickListener(image, outputter);
        addImageStarClickListener(image, outputter);
    }

    function addImageExpandClickListener(image: ImageDetail, outputter: IOutputter) {
        const imageExpandDivId = HtmlGrid.getImageExpandDivId(image);

        const imageExpandDiv = document.getElementById(imageExpandDivId);
        if (!imageExpandDiv) {
            outputter.error(`could not find image expand div '${imageExpandDivId}'`);
            return;
        }

        ExpandedImageRenderer.addImage(image);

        imageExpandDiv.addEventListener("click", () =>
            ExpandedImageRenderer.onClickExpandImage(image)
        );
    }

    function addImageNewWindowClickListener(image: ImageDetail, outputter: IOutputter) {
        const imageNewWindowDivId = HtmlGrid.getImageOpenNewWindowDivId(image);

        const imageNewWindowDiv = document.getElementById(imageNewWindowDivId);
        if (!imageNewWindowDiv) {
            outputter.error(`could not find image new window div '${imageNewWindowDivId}'`);
            return;
        }

        imageNewWindowDiv.addEventListener("click", () => onClickOpenImageInNewWindow(image));
    }

    function addImageStarClickListener(image: ImageDetail, outputter: IOutputter) {
        const starContainerId = HtmlGrid.getImageStarContainerDivId(image);

        const starDiv = document.getElementById(starContainerId);
        if (!starDiv) {
            outputter.error(`could not find image star div '${starContainerId}'`);
            return;
        }

        starDiv.addEventListener("click", () => onClickImageStar(image));
    }

    function onClickImageStar(image: ImageDetail) {
        ImageStarRenderer.toggleStarForImage(image);
    }

    let previousImageSelected: ImageDetail | null = null;

    function onClickImage(state: State, image: ImageDetail, outputter: IOutputter) {
        state.selectedImage = image;
        setImageHeader(image);
        HistogramRenderer.setHistogramAsLoading();

        if (previousImageSelected) {
            setImageBorder(previousImageSelected, BorderStyle.None, outputter);
        }
        setImageBorder(image, BorderStyle.Selected, outputter);
        previousImageSelected = image;

        DetailPaneRenderer.renderDetailForImage(image, outputter);
    }

    function setImageHeader(image: ImageDetail) {
        jquery("#detail-header-text").text("image: " + image.filename);
    }

    function onClickOpenImageInNewWindow(image: ImageDetail) {
        window.open(`file://${image.originalFilepath}`, "_blank", "nodeIntegration=no");
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
}
