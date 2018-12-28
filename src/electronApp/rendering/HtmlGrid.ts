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

    clearImagesContainer() {
        JQueryUtils.clearHtmlDiv(IMAGE_CONTAINER_ID);
    }

    getHeaderHtml(imageInputDir: string): string {
        let html = "";
        html += this.getContainerStart(Orientation.Horizontal, "grid-header-container");
        html += `<div class="grid-header">Images at '${imageInputDir}'${this.renderBrowseButton()}</div>`;
        html += this.getContainerEnd();
        return html;
    }

    getImagesContainerHtml(): string {
        return `<div id="${IMAGE_CONTAINER_ID}"></div>`;
    }

    addImageToContainer(image: ImageDetail) {
        this.getImageContainerDiv().append(this.getImageHtml(image));
    }

    private getImageContainerDiv(): JQuery<HTMLElement> {
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
        return `<div class="image-container"><img class="user-image user-image-not-selected" src="${
            image.smallerFilepath
        }" id="${HtmlGrid.getImageDivId(image)}"' width="250px" /></div>`;
    };
}
