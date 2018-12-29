import * as jquery from "jquery";

import { JQueryUtils } from "../../utils/JQueryUtils";
import { HtmlGrid } from "./HtmlGrid";

export namespace LoaderRenderer {
    export function getLoaderHtml(): string {
        return `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
    }

    export function showImagesLoading() {
        JQueryUtils.renderHtml(getLoaderHtml(), HtmlGrid.getImagesContainerId());
    }

    export function hideImagesLoading() {
        jquery(`#${HtmlGrid.getImagesContainerId()} .lds-ring`).hide();
    }
}
