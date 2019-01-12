import * as fs from "fs";
import * as path from "path";

import { ImageDetail } from "../../../bars/model/ImageDetail";
import { ExifTagSet } from "./ExifTagSet";

const jpegDecoder = require("jpg-stream/decoder");

export namespace ExifReader {
    export async function getExifTagsForImageAsync(
        image: ImageDetail
    ): Promise<ExifTagSet[] | null> {
        if (!canFileHaveExif(image.originalFilepath)) {
            return null;
        }

        return new Promise<ExifTagSet[]>((resolve, reject) => {
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

    export function canFileHaveExif(filepath: string): boolean {
        const extension = path.extname(filepath).toLowerCase();

        // currently we are decoding only JPEG files.
        // note: some PNG files can have some EXIF data but it's not yet standard.

        return [".jpg", ".jpeg"].includes(extension);
    }

    function parseExif(meta: any): ExifTagSet[] {
        deleteUnusedTags(meta);

        const result = [
            ExifTagSet.fromTags(meta.exif, "Image"),
            ExifTagSet.fromTags(meta.image, "Device"),
            ExifTagSet.fromTags(meta.gps, "GPS")
        ].filter(e => !!e) as ExifTagSet[];

        deleteAllTags(meta);

        return result;
    }

    const DELETED = {};

    function deleteUnusedTags(tags: any) {
        // The MakerNote tag can be really large. Remove it to lower memory
        // usage if you're parsing a lot of files and saving the tags.
        if (tags.exif) {
            tags.exif.MakerNote = DELETED;
        }

        tags.thumbnail = DELETED;
    }

    function deleteAllTags(tags: any) {
        tags.exif = DELETED;
        tags.image = DELETED;
        tags.gps = DELETED;
    }
}
