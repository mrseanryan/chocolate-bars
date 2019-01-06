import * as fs from "fs";
import * as path from "path";
import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";

const jpegDecoder = require("jpg-stream/decoder");

export namespace ExifRenderer {
    export async function getHtmlForImage(image: ImageDetail, divId: string) {
        const html = await getHtmlForImageAsync(image);

        jquery("#" + divId).append(html);
    }

    async function getHtmlForImageAsync(image: ImageDetail): Promise<string> {
        if(!hasFileExif(image.originalFilepath)) {
            return "";
        }

        return new Promise<string>((resolve, reject) => {
            // decode a JPEG file to RGB pixels
            fs.createReadStream(image.originalFilepath)
                .pipe(new jpegDecoder({ width: 600, height: 400 }))
                .on("meta", (meta: any) => {
                    // meta contains an exif object as decoded by
                    // https://github.com/devongovett/exif-reader

                    resolve(parseExif(meta));
                });
        });
    }

    function hasFileExif(filepath: string): boolean {
        const extension = path.extname(filepath).toLowerCase();

        // currently we are decoding only JPEG files.
        // note: some PNG files can have some EXIF data but it's not yet standard.

        return [".jpg", ".jpeg"].includes(extension);
    }

    function parseExif(meta: any): string {
        let html = "<pre>";

        const extract = (holder: any, prop: string): string => {
            return holder[prop] ? `${[prop]}: ${holder[prop]}\n` : "";
        };

        const addSection = (title: string, sectionHtml: string) => {
            if (sectionHtml.length > 0) {
                html += `--- ${title} ---\n` + sectionHtml;
            }
        };

        if (meta.exif) {
            let imageHtml = "";

            const exif = meta.exif;
            imageHtml += extract(exif, "ApertureValue");
            imageHtml += extract(exif, "BrightnessValue");
            imageHtml += extract(exif, "FNumber");
            imageHtml += extract(exif, "Flash");
            imageHtml += extract(exif, "FocalLength");
            imageHtml += extract(exif, "ISO");

            addSection("Image", imageHtml);
        }

        if (meta.gps) {
            let gpsHtml = "";

            const gps = meta.gps;
            gpsHtml += extract(gps, "GPSAltitude");
            gpsHtml += extract(gps, "GPSAltitudeRef");
            gpsHtml += extract(gps, "GPSLatitude");
            gpsHtml += extract(gps, "GPSLatitudeRef");

            addSection("GPS", gpsHtml);
        }

        if (meta.image) {
            let imageHtml = "";

            const gps = meta.image;
            imageHtml += extract(gps, "ModifyDate");
            imageHtml += extract(gps, "Orientation");
            imageHtml += extract(gps, "Software");
            imageHtml += extract(gps, "XResolution");
            imageHtml += extract(gps, "YResolution");
            imageHtml += extract(gps, "Make");
            imageHtml += extract(gps, "Model");

            addSection("Device", imageHtml);
        }

        html += "</pre>";

        return html;
    }
}
