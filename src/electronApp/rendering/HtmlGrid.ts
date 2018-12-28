import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { JQueryUtils } from "../../utils/JQueryUtils";

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

    clearImagesContainer() {
        JQueryUtils.clearHtmlDivById(IMAGE_CONTAINER_ID);
    }

    clearPagerContainer() {
        JQueryUtils.clearHtmlDivByClass("image-pager");
    }

    setTitleForDir(imageInputDir: string) {
        jquery(".grid-header").html(`Images at '${imageInputDir}'${this.renderBrowseButton()}`);
    }

    getHeaderHtml(): string {
        let html = "";
        html += this.getContainerStart(Orientation.Horizontal, "grid-header-container");
        html += `<div class="grid-header"></div>`;
        html += this.getContainerEnd();
        return html;
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

    private getImageContainerDiv(): JQuery {
        return jquery(`#images-wrapping-container`);
    }

    private renderBrowseButton(): string {
        return `<button id="browseButton">Browse...</button>`;
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
            `</div>`
        );
    };
}
