import * as jquery from "jquery";

import { ImageFinder } from "../../bars/files/ImageFinder";
import { PagingModel } from "../../bars/model/PagingModel";
import { JQueryUtils } from "../../utils/JQueryUtils";
import { IOutputter } from "../../utils/outputter/IOutputter";
import { State } from "../State";
import { LoaderRenderer } from "./LoaderRenderer";

export namespace PagerRenderer {
    export async function renderPagerButtons(
        state: State,
        outputter: IOutputter,
        renderImagesAndPager: () => void
    ) {
        let pageCount = 0;
        let imageCountThisPage = 0;

        clearPagerContainer();

        // Always have a 1st page - else off by one issue with pages!
        renderPager(pageCount, state, outputter, renderImagesAndPager);
        pageCount++;

        const allImages = await ImageFinder.findImagesInDirectory(state.imageInputDir, outputter);

        allImages.forEach(() => {
            imageCountThisPage++;

            if (imageCountThisPage > PagingModel.IMAGES_PER_PAGE) {
                renderPager(pageCount, state, outputter, renderImagesAndPager);

                pageCount++;
                imageCountThisPage = 1;
            }
        });

        if (pageCount < 2) {
            clearPagerContainer();
        }
    }

    function renderPager(
        pageId: number,
        state: State,
        outputter: IOutputter,
        renderImagesAndPager: () => void
    ) {
        const isCurrent = pageId === state.currentPage;
        const disabled = isCurrent ? " disabled" : "";
        const currentClass = isCurrent ? " image-pager-button-current" : "";

        const pagerHtml = `<button id='button-pager-${pageId}}'${disabled} class="image-pager-button${currentClass}">${pageId +
            1}</button>`;
        jquery(".image-pager").append(pagerHtml);

        addPagerClickListener(pageId, state, outputter, renderImagesAndPager);
    }

    function clearPagerContainer() {
        JQueryUtils.clearHtmlDivByClass("image-pager");
    }

    export function addPagerClickListener(
        pageId: number,
        state: State,
        outputter: IOutputter,
        renderImagesAndPager: () => void
    ) {
        const pageDiv = document.getElementById(`button-pager-${pageId}}`);
        if (!pageDiv) {
            outputter.error(`could not find page button div for '${pageId}'`);
            return;
        }

        pageDiv.addEventListener("click", () => onClickPager(pageId, state, renderImagesAndPager));
    }

    function onClickPager(pageId: number, state: State, renderImagesAndPager: () => void) {
        state.epoch++;

        state.currentPage = pageId;

        LoaderRenderer.showImagesLoading();

        // use setTimeout to ensure loader appears
        setTimeout(() => {
            // a new pager button may become disabled - so also need to render the pager buttons.
            renderImagesAndPager();
        }, 250);
    }
}
