import * as fs from "fs";
import * as path from "path";

import { ImageDetail } from "../../../bars/model/ImageDetail";
import { ExifTagSet } from "./ExifTagSet";

const jpegDecoder = require("jpg-stream/decoder");

// Reduce memory usage by assuming EXIF is in first part of the file
const MAX_BYTES_TO_READ = 128 * 1024;

export namespace ExifReader {
    export async function getExifTagsForImageAsync(
        image: ImageDetail
    ): Promise<ExifTagSet[] | null> {
        if (!canFileHaveExif(image.originalFilepath)) {
            return null;
        }

        return new Promise<ExifTagSet[]>((resolve, reject) => {
            // Decode a JPEG file to RGB pixels
            const stream: fs.ReadStream = fs.createReadStream(image.originalFilepath, {
                end: MAX_BYTES_TO_READ
            });

            stream.pipe(new jpegDecoder({ width: 600, height: 400 })).on("meta", (meta: any) => {
                // meta contains an exif object as decoded by
                // https://github.com/devongovett/exif-reader

                const result = parseExif(meta);
                closeStreamAndResolve(result);
            });

            // Reduce memory usage by avoiding reading past the meta data
            const closeStreamAndResolve = (result: ExifTagSet[]) => {
                // ref: https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
                stream.close(); // This may not close the stream.
                // Artificially marking end-of-stream, as if the underlying resource had
                // indicated end-of-file by itself, allows the stream to close.
                // This does not cancel pending read operations, and if there is such an
                // operation, the process may still not be able to exit successfully
                // until it finishes.
                stream.push(null);
                stream.read(0);

                resolve(result);
            };
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
