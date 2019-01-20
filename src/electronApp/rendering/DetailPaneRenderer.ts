import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { JQueryUtils } from "../../utils/JQueryUtils";
import { MathUtils } from "../../utils/MathUtils";
import { IOutputter } from "../../utils/outputter/IOutputter";
import { ExifRenderer } from "./exif/ExifRenderer";
import { HistogramRenderer } from "./HistogramRenderer";
import { LoaderRenderer } from "./LoaderRenderer";

export namespace DetailPaneRenderer {
    export function renderDetailForImage(image: ImageDetail, outputter: IOutputter) {
        clear();

        HistogramRenderer.renderHistogramForImage(image, outputter)
            .then(() => {
                renderImageText(image, outputter);
            })
            .catch(error => outputter.error(error));
    }

    export function clear() {
        jquery("#image-text")
            .children()
            .remove();

        HistogramRenderer.clear();
    }

    export function renderDetailContainer() {
        const html =
            `<div class="container-vertical fullHeight">` +
            `<div id="detail-header"><div id="detail-header-text"/></div>` +
            `<div class="container detail-body">` +
            `<div class="${HistogramRenderer.getHistogramContainerClass()}">${LoaderRenderer.getLoaderHtml()}` +
            `<div id="${HistogramRenderer.getHistogramContainerId()}"/></div>` +
            `<div id="image-text" class="fullHeight"></div>` +
            `</div>` +
            `</div>`;

        JQueryUtils.renderHtml(html, "detail-panel");
    }

    function renderImageText(image: ImageDetail, outputter: IOutputter) {
        const html =
            // tslint:disable-next-line:prefer-template
            `<div>dimensions: ${image.dimensions.width} x ${image.dimensions.height}</div>` +
            `<div>file size: ${MathUtils.roundToFewPlaces(image.fileSizeInMb)} Mb</div>` +
            `<div id="image-exif" class="exif-container"></div>`;

        ExifRenderer.renderHtmlForImage(image, "image-exif", outputter);

        jquery("#image-text").append(html);
    }
}
