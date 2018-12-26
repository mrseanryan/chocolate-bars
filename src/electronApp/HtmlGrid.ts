import { ImageDetail } from "../bars/model/ImageDetail";

const MAX_IMAGES_PER_ROW = 1;

enum Orientation {
    Vertical,
    Horizontal
}

export class HtmlGrid {
    private row: ImageDetail[] = [];

    addImage(image: ImageDetail) {
        this.row.push(image);
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

        this.row.length = 0;

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
            Orientation.Horizontal,
            "halfWidth"
        )}\n<div class="image-container"><img class="user-image" src="${
            image.smallerFilepath
        }" width="250px" /></div>\n${this.getImageTextHtml(image)}\n${this.getContainerEnd()}`;
    };

    private getImageTextHtml(image: ImageDetail): string {
        return `${this.getContainerStart(Orientation.Vertical, "halfWidth")}\n<div>${
            image.filename
        }</div>\n${this.getContainerEnd()}`;
    }
}
