import * as jquery from "jquery";

import { ImageDetail } from "../../../bars/model/ImageDetail";
import { IOutputter } from "../../../utils/outputter/IOutputter";
import { StringUtils } from "../../../utils/StringUtils";
import { ExifReader } from "./ExifReader";
import { ExifTagSet } from "./ExifTagSet";

export namespace ExifRenderer {
    export async function renderHtmlForImage(
        image: ImageDetail,
        divId: string,
        outputter: IOutputter
    ) {
        const html = await getHtmlForImageAsync(image, outputter);

        jquery("#" + divId).append(html);
    }

    async function getHtmlForImageAsync(
        image: ImageDetail,
        outputter: IOutputter
    ): Promise<string> {
        const tagSets = await ExifReader.getExifTagsForImageAsync(image, outputter);
        if (!tagSets) {
            return "";
        }

        let html = "<div class='exif-container-text'>";

        html += tagSets.map(set => renderTagSet(set)).join("");

        html = StringUtils.replaceAll(html, "\n", "<br/>");

        html += "</div>";

        return html;
    }

    function renderTagSet(tagSet: ExifTagSet): string {
        let sectionHtml = "";

        tagSet.map.forEach((value, key) => {
            const valueAsText = value.toString();
            sectionHtml += valueAsText.length > 0 ? `${key}: ${valueAsText}\n` : "";
        });

        if (sectionHtml.length > 0) {
            return `--- ${tagSet.title} ---\n` + sectionHtml;
        }

        return "";
    }
}
