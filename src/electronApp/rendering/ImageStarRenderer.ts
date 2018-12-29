import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { DataStorage } from "../../bars/model/persisted/DataStorage";
import { ExpandedImageRenderer } from "./ExpandedImageRenderer";
import { HtmlGrid } from "./HtmlGrid";

export namespace ImageStarRenderer {
    export const STAR_CONTAINER_CLASS = "star-container";

    export function getStarContainerHtml(image: ImageDetail): string {
        return `<div class="${STAR_CONTAINER_CLASS}">${getStarOrNoStarHtml(image)}</div>`;
    }

    // export function getStarHtml(image: ImageDetail): string {
    //     return image.isStarred ? `<div class="star">*</div>` : ``;
    // }

    export function getStarOrNoStarHtml(image: ImageDetail): string {
        return image.isStarred ? `<div class="star">*</div>` : `<div class="no-star"></div>`;
    }

    export function toggleStarForImage(image: ImageDetail) {
        DataStorage.toggleStarredImage(image);

        updateStarForExpandedImage(image);
    }

    export function updateStarForExpandedImage(image: ImageDetail) {
        jquery(`.${ExpandedImageRenderer.IMAGE_POPUP_CLASS} .star-container`).html(
            getStarOrNoStarHtml(image)
        );

        jquery(`#${HtmlGrid.getImageStarContainerDivId(image)}`).html(getStarOrNoStarHtml(image));
    }
}
