import { ImageDetail } from "../../bars/model/ImageDetail";

const MAX_IMAGES_PER_ROW = 3;

enum Orientation {
    Vertical,
    Horizontal
}

export class HtmlGrid {
    static getImageDivId(image: ImageDetail): string {
        return `image-id-${image.id}`;
    }

    private row: ImageDetail[] = [];

    addImage(image: ImageDetail) {
        this.row.push(image);
    }

    clearRow() {
        this.row.length = 0;
    }

    hasRow(): boolean {
        return this.row.length > 0;
    }

    isRowFull(): boolean {
        return this.row.length >= MAX_IMAGES_PER_ROW;
    }

    getRowHtml = (): string => {
        let html = "";

        html += this.getContainerStart();

        this.row.forEach(image => {
            html += this.getImageHtml(image);
        });

        html += this.getContainerEnd();

        return html;
    };

    getHeaderHtml(imageInputDir: string): string {
        let html = "";
        html += this.getContainerStart();
        html += `<div class="grid-header">Images at '${imageInputDir}'</div>`;
        html += this.getContainerEnd();
        return html;
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
        return `${this.getContainerStart(
            Orientation.Horizontal
        )}\n<div class="image-container"><img class="user-image user-image-not-selected" src="${
            image.smallerFilepath
        }" id="${HtmlGrid.getImageDivId(image)}"' width="250px" /></div>${this.getContainerEnd()}`;
    };
}
