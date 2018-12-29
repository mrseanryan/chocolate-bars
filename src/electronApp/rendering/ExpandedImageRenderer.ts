import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { JQueryUtils } from "../../utils/JQueryUtils";

const SHOW_POPUP_BUTTON_CLASS = "user-image-popup";

export namespace ExpandedImageRenderer {
    let allImages: ImageDetail[] = [];
    let currentImageIndex = -1;

    export function addImage(image: ImageDetail) {
        allImages.push(image);
    }

    export function clearImages() {
        allImages.length = 0;
    }

    export function renderHiddenPopup() {
        const html = `<div class="${SHOW_POPUP_BUTTON_CLASS}" />`;

        jquery("body").append(html);

        addClickExpandedImageListener();
    }

    function addClickExpandedImageListener() {
        jquery(`.${SHOW_POPUP_BUTTON_CLASS}`).on("click", () => {
            hideExpandedImage();
        });
    }

    export function onClickExpandImage(image: ImageDetail) {
        currentImageIndex = allImages.findIndex(i => i.originalFilepath === image.originalFilepath);

        updateCurrentImageByIndex();

        jquery(`.${SHOW_POPUP_BUTTON_CLASS}`).addClass("user-image-popup-visible");
    }

    export function hideExpandedImage() {
        jquery(`.${SHOW_POPUP_BUTTON_CLASS}`).removeClass("user-image-popup-visible");
    }

    function updateCurrentImageByIndex() {
        const image = allImages[currentImageIndex];
        if (!image) {
            return;
        }

        JQueryUtils.clearHtmlDivByClass(SHOW_POPUP_BUTTON_CLASS);

        // use the smaller image, as is smaller and already loaded - so faster
        const imageHtml = `<img src="${image.smallerFilepath}" />`;

        jquery(`.${SHOW_POPUP_BUTTON_CLASS}`).append(imageHtml);
    }

    export function goToPreviousImage() {
        currentImageIndex--;
        if (currentImageIndex < 0) {
            currentImageIndex = 0;
        }

        updateCurrentImageByIndex();
    }

    export function goToNextImage() {
        currentImageIndex++;
        if (currentImageIndex >= allImages.length) {
            currentImageIndex = allImages.length - 1;
        }

        updateCurrentImageByIndex();
    }
}
