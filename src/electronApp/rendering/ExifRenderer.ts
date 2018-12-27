import * as fs from "fs";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { IOutputter } from "../../utils/outputter/IOutputter";

const exif = require("exif-reader");

export namespace ExifRenderer {
    export function getHtmlForImage(image: ImageDetail, outputter: IOutputter): string {
        let html = "";

        const buffer = fs.readFileSync(image.originalFilepath);

        // xxx
        const exifData = exif(buffer);

        console.log("xxx exif", exifData);

        return html;
    }
}
