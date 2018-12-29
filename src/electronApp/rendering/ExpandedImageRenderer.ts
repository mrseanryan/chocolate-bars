import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { JQueryUtils } from "../../utils/JQueryUtils";

export namespace ExpandedImageRenderer {
    export function renderHiddenPopup() {
        const html = `<div class="user-image-popup" />`;

        jquery("body").append(html);

        addClickExpandedImageListener();
    }

    function addClickExpandedImageListener() {
        jquery(".user-image-popup").on("click", () => {
            onClickExpandedImagePopup();
        });
    }

    export function onClickExpandImage(image: ImageDetail) {
        JQueryUtils.clearHtmlDivByClass("user-image-popup");

        // use the smaller image, as is smaller and already loaded - so faster
        const imageHtml = `<img src="${image.smallerFilepath}" />`;

        jquery(".user-image-popup").append(imageHtml);

        jquery(".user-image-popup").addClass("user-image-popup-visible");
    }

    export function onClickExpandedImagePopup() {
        jquery(".user-image-popup").removeClass("user-image-popup-visible");
    }
}
