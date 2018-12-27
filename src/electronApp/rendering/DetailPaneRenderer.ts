import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { MathUtils } from "../../utils/MathUtils";
import { IOutputter } from "../../utils/outputter/IOutputter";
import { ExifRenderer } from "./ExifRenderer";
import { HistogramRenderer } from "./HistogramRenderer";

export namespace DetailPaneRenderer {
    export function renderDetailForImage(image: ImageDetail, outputter: IOutputter) {
        clear();

        HistogramRenderer.renderHistogramForImage(image, outputter)
            .then(() => {
                renderImageText(image, outputter);
            })
            .catch(error => outputter.error(error));
    }

    function clear() {
        jquery("#image-text")
            .children()
            .remove();

        HistogramRenderer.clear();
    }

    function renderImageText(image: ImageDetail, outputter: IOutputter) {
        const html =
            // tslint:disable-next-line:prefer-template
            `<div>dimensions: ${image.dimensions.width} x ${image.dimensions.height}</div>` +
            `<div>file size: ${MathUtils.roundToFewPlaces(image.fileSizeInMb)} Mb</div>` +
            ExifRenderer.getHtmlForImage(image, outputter);

        jquery("#image-text").append(html);
    }
}
