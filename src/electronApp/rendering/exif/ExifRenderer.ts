import * as jquery from "jquery";

import { ImageDetail } from "../../../bars/model/ImageDetail";
import { ExifReader } from "./ExifReader";
import { ExifTagSet } from "./ExifTagSet";

export namespace ExifRenderer {
    export async function renderHtmlForImage(image: ImageDetail, divId: string) {
        const html = await getHtmlForImageAsync(image);

        jquery("#" + divId).append(html);
    }

    async function getHtmlForImageAsync(image: ImageDetail): Promise<string> {
        const tagSets = await ExifReader.getExifTagsForImageAsync(image);
        if (!tagSets) {
            return "";
        }

        let html = "<pre>";

        html += tagSets.map(set => renderTagSet(set)).join("\n");

        html += "</pre>";

        return html;
    }

    function renderTagSet(tagSet: ExifTagSet): string {
        let sectionHtml = "";

        tagSet.map.forEach((value, key) => {
            if (value !== null && value !== undefined) {
                const valueAsText = value.toString();
                sectionHtml += valueAsText.length > 0 ? `${key}: ${valueAsText}\n` : "";
            }
        });

        if (sectionHtml.length > 0) {
            return `--- ${tagSet.title} ---\n` + sectionHtml;
        }

        return "";
    }
}