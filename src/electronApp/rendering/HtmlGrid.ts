import { ImageDetail } from "../../bars/model/ImageDetail";

enum Orientation {
    Vertical,
    Horizontal
}

export class HtmlGrid {
    static getImageDivId(image: ImageDetail): string {
        return `image-id-${image.id}`;
    }

    private images: ImageDetail[] = [];

    addImage(image: ImageDetail) {
        this.images.push(image);
    }

    getHeaderHtml(imageInputDir: string): string {
        let html = "";
        html += this.getContainerStart();
        html += `<div class="grid-header">Images at '${imageInputDir}'</div>`;
        html += this.getContainerEnd();
        return html;
    }

    getImagesHtml(): string {
        const imagesHtml = this.images
            .map(this.getImageHtml)
            .reduce((prev, current) => prev + current, "");

        return this.getImagesContainerStart() + imagesHtml + this.getClosingHtml();
    }

    private getImagesContainerStart(): string {
        return `<div class="images-wrapping-container">`;
    }

    getClosingHtml(): string {
        return `</div>`;
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
