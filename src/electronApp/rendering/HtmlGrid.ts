import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";

enum Orientation {
    Vertical,
    Horizontal
}

export class HtmlGrid {
    static getImageDivId(image: ImageDetail): string {
        return `image-id-${image.id}`;
    }

    getHeaderHtml(imageInputDir: string): string {
        let html = "";
        html += this.getContainerStart(Orientation.Horizontal, "grid-header-container");
        html += `<div class="grid-header">Images at '${imageInputDir}'${this.renderBrowseButton()}</div>`;
        html += this.getContainerEnd();
        return html;
    }

    getImagesContainerHtml(): string {
        return `<div class="images-wrapping-container"></div>`;
    }

    addImageToContainer(image: ImageDetail) {
        const jqueryDiv = jquery(`.images-wrapping-container`);
        jqueryDiv.append(this.getImageHtml(image));
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
