import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { JQueryUtils } from "../../utils/JQueryUtils";
import { ImageStarRenderer } from "./ImageStarRenderer";

export namespace ExpandedImageRenderer {
    export const IMAGE_POPUP_CLASS = "user-image-popup";

    let allImages: ImageDetail[] = [];
    let currentImageIndex = -1;
    let isPopupOpen = false;

    export function isOpen(): boolean {
        return isPopupOpen;
    }

    export function addImage(image: ImageDetail) {
        allImages.push(image);
    }

    export function clearImages() {
        allImages.length = 0;
    }

    export function renderHiddenPopup() {
        isPopupOpen = false;
        const html = `<div class="${IMAGE_POPUP_CLASS}" />`;

        jquery("body").append(html);

        addClickExpandedImageListener();
    }

    function addClickExpandedImageListener() {
        jquery(`.${IMAGE_POPUP_CLASS}`).on("click", () => {
            hideExpandedImage();
        });
    }

    function addClickImageStarListener() {
        jquery(`.${IMAGE_POPUP_CLASS} .${ImageStarRenderer.STAR_CONTAINER_CLASS}`).on(
            "click",
            () => {
                toggleStarredImage();

                // prevent the expanded image from closing:
                return false;
            }
        );
    }

    export function onClickExpandImage(image: ImageDetail) {
        currentImageIndex = allImages.findIndex(i => i.originalFilepath === image.originalFilepath);
        isPopupOpen = true;

        updateCurrentImageByIndex();

        jquery(`.${IMAGE_POPUP_CLASS}`).addClass("user-image-popup-visible");
    }

    export function hideExpandedImage() {
        isPopupOpen = false;
        jquery(`.${IMAGE_POPUP_CLASS}`).removeClass("user-image-popup-visible");
    }

    function updateCurrentImageByIndex() {
        const image = getCurrentImage();

        // TODO could clear just the image - not the star
        JQueryUtils.clearHtmlDivByClass(IMAGE_POPUP_CLASS);

        // use the smaller image, as is smaller and already loaded - so faster
        const imageHtml = `<div class="expanded-image-and-star"><img src="${
            image.smallerFilepath
        }" />${ImageStarRenderer.getStarContainerHtml(image)}</div>`;

        jquery(`.${IMAGE_POPUP_CLASS}`).append(imageHtml);
        addClickImageStarListener();
    }

    function getCurrentImage() {
        const image = allImages[currentImageIndex];
        return image;
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

    export function toggleStarredImage() {
        const image = getCurrentImage();
        if (!image) {
            return;
        }

        ImageStarRenderer.toggleStarForImage(image);
    }
}
