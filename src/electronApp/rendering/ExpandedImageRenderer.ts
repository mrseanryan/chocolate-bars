import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { JQueryUtils } from "../../utils/JQueryUtils";

const SHOW_POPUP_BUTTON_CLASS = "user-image-popup";

export namespace ExpandedImageRenderer {
    export function renderHiddenPopup() {
        const html = `<div class="${SHOW_POPUP_BUTTON_CLASS}" />`;

        jquery("body").append(html);

        addClickExpandedImageListener();
    }

    function addClickExpandedImageListener() {
        jquery(`.${SHOW_POPUP_BUTTON_CLASS}`).on("click", () => {
            onClickExpandedImagePopup();
        });
    }

    export function onClickExpandImage(image: ImageDetail) {
        JQueryUtils.clearHtmlDivByClass(SHOW_POPUP_BUTTON_CLASS);

        // use the smaller image, as is smaller and already loaded - so faster
        const imageHtml = `<img src="${image.smallerFilepath}" />`;

        jquery(`.${SHOW_POPUP_BUTTON_CLASS}`).append(imageHtml);

        jquery(`.${SHOW_POPUP_BUTTON_CLASS}`).addClass("user-image-popup-visible");
    }

    export function onClickExpandedImagePopup() {
        jquery(`.${SHOW_POPUP_BUTTON_CLASS}`).removeClass("user-image-popup-visible");
    }
}
