import * as jquery from "jquery";
import * as path from "path";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { JQueryUtils } from "../../utils/JQueryUtils";
import { ClearStarredImagesRenderer } from "./ClearStarredImagesRenderer";
import { ImageStarRenderer } from "./ImageStarRenderer";
import { MoveStarredImagesRenderer } from "./MovedStarredImagesRenderer";
import { RefreshImagesRenderer } from "./RefreshImagesRenderer";
import { SelectDirectoryRenderer } from "./SelectDirectoryRenderer";

const IMAGE_CONTAINER_ID = "images-wrapping-container";

enum Orientation {
    Vertical,
    Horizontal
}

export class HtmlGrid {
    static getImageDivId(image: ImageDetail): string {
        return `image-id-${image.id}`;
    }

    static getImageExpandDivId(image: ImageDetail): string {
        return this.getImageDivId(image) + "-expand";
    }

    static getImageOpenNewWindowDivId(image: ImageDetail): string {
        return this.getImageDivId(image) + "-new-window";
    }

    static getImageStarContainerDivId(image: ImageDetail): string {
        return this.getImageDivId(image) + "-star-container";
    }

    static getImagesContainerId() {
        return IMAGE_CONTAINER_ID;
    }

    clearImagesContainer() {
        JQueryUtils.clearHtmlDivById(IMAGE_CONTAINER_ID);
    }

    setTitleForDir(imageInputDir: string) {
        const absolutePath = path.resolve(imageInputDir);

        jquery(".grid-header").html(`Images at '${absolutePath}'`);
    }

    getHeaderHtml(): string {
        let html = "";
        html += this.getContainerStart(Orientation.Horizontal, "grid-header-container");
        html += `<div class="grid-header"/>${this.getButtonsHtml()}`;
        html += this.getContainerEnd();
        return html;
    }

    private getButtonsHtml(): string {
        return (
            RefreshImagesRenderer.getButtonHtml() +
            MoveStarredImagesRenderer.getButtonHtml() +
            ClearStarredImagesRenderer.getButtonHtml() +
            SelectDirectoryRenderer.getBrowseButtonHtml()
        );
    }

    getImagesAndPagerContainerHtml(): string {
        return (
            `${this.getContainerStart(Orientation.Horizontal, "images-and-pager-container")}` +
            `<div id="${IMAGE_CONTAINER_ID}"></div>` +
            `<div class="image-pager"></div>` +
            `${this.getContainerEnd()}`
        );
    }

    addImageToContainer(image: ImageDetail) {
        this.getImageContainerDiv().append(this.getImageHtml(image));
    }

    renderForNoImages() {
        const noImagesHtml = `<div class="no-images">[No images to display]</div>`;

        this.getImageContainerDiv().append(noImagesHtml);
    }

    private getImageContainerDiv(): JQuery {
        return jquery(`#images-wrapping-container`);
    }

    private getContainerStart(
        orientation: Orientation = Orientation.Horizontal,
        extraClass: string = ""
    ): string {
        return orientation === Orientation.Horizontal
            ? `<div class='container ${extraClass}'>`
            : `<div class='container-vertical ${extraClass}'>`;
    }

    private getContainerEnd(): string {
        return `</div>`;
    }

    private getImageHtml = (image: ImageDetail): string => {
        return (
            `<div class="image-container"><img class="user-image user-image-not-selected" src="${
                image.smallerFilepath
            }" id="${HtmlGrid.getImageDivId(image)}"' width="250px" />` +
            `<div id="${HtmlGrid.getImageExpandDivId(image)}" class="user-image-expand"/>` +
            `<div id="${HtmlGrid.getImageOpenNewWindowDivId(
                image
            )}" class="user-image-new-window"/>` +
            `<div id="${HtmlGrid.getImageStarContainerDivId(image)}" class="${
                ImageStarRenderer.STAR_CONTAINER_CLASS
            }">${ImageStarRenderer.getStarOrNoStarHtml(image)}</div>` +
            `</div>`
        );
    };
}
