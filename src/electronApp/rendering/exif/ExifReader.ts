import * as fs from "fs";
import * as path from "path";

import { ImageDetail } from "../../../bars/model/ImageDetail";
import { IOutputter } from "../../../utils/outputter/IOutputter";
import { ExifTagSet } from "./ExifTagSet";

// To solve warning from exifreader
(global as any).DOMParser = require("xmldom").DOMParser;

const exifReader = require("exifreader");

// Reduce memory usage by assuming EXIF is in first part of the file
const MAX_BYTES_TO_READ = 128 * 1024;

export namespace ExifReader {
    export async function getExifTagsForImageAsync(
        image: ImageDetail,
        outputter: IOutputter
    ): Promise<ExifTagSet | null> {
        if (!canFileHaveExif(image.originalFilepath)) {
            return null;
        }

        return new Promise<ExifTagSet | null>((resolve, reject) => {
            fs.open(image.originalFilepath, "r", function(status, fd) {
                if (status) {
                    console.error(status.message);
                    reject(status.message);
                    return;
                }
                const buffer = Buffer.alloc(MAX_BYTES_TO_READ);

                fs.read(fd, buffer, 0, MAX_BYTES_TO_READ, 0, function(err) {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }

                    try {
                        const exifResult = parseExif(buffer, outputter);
                        resolve(exifResult);
                    } catch (error) {
                        if (error.name === "MetadataMissingError") {
                            // no exif data
                            resolve(null);
                        } else {
                            reject(error);
                        }
                    }
                });
            });
        });
    }

    export function canFileHaveExif(filepath: string): boolean {
        const extension = path.extname(filepath).toLowerCase();

        // currently we are decoding only JPEG files.
        // note: some PNG files can have some EXIF data but it's not yet standard.

        return [".jpg", ".jpeg"].includes(extension);
    }

    function parseExif(buffer: Buffer, outputter: IOutputter): ExifTagSet | null {
        const tags = exifReader.load(buffer.buffer);

        deleteUnusedTags(tags);

        const tagset = ExifTagSet.fromTags(tags, outputter);

        deleteAllTags(tags);

        return tagset;
    }

    const DELETED = {};

    function deleteUnusedTags(tags: any) {
        // The MakerNote tag can be really large. Remove it to lower memory
        // usage if you're parsing a lot of files and saving the tags.
        tags.MakerNote = DELETED;

        // also delete any props that start with 'undefined-
        Object.keys(tags)
            .filter(t => t.startsWith("undefined"))
            .forEach(t => {
                tags[t] = DELETED;
            });

        tags.thumbnail = DELETED;
    }

    function deleteAllTags(tags: any) {
        Object.keys(tags).forEach(t => {
            tags[t] = DELETED;
        });
    }
}
