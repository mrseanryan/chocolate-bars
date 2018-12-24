import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const sharp = require("sharp");

import { IOutputter } from "../../utils/outputter/IOutputter";

const MAX_DIMENSION = 800;

export namespace ImageResizer {
    function getFilesizeInMegaBytes(filename: string): number {
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        return fileSizeInBytes / (1024 * 1024);
    }

    export async function resizeImage(filePath: string, outputter: IOutputter): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!isLargeImage(filePath)) {
                resolve(filePath);
                return;
            }

            resizeImageCb(filePath, outputter, (outPath, err) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!outPath) {
                    reject(`resize resulted in a null image path`);
                    return;
                }

                resolve(outPath);
            });
        });
    }

    function isLargeImage(filePath: string): boolean {
        return getFilesizeInMegaBytes(filePath) > 0.5;
    }

    // ref: https://github.com/lovell/sharp
    function resizeImageCb(
        filePath: string,
        outputter: IOutputter,
        cb: (outPath: string | null, err: any) => void
    ) {
        const outPath = path.join(os.tmpdir(), path.basename(filePath) + ".resized.jpg");

        // read file to avoid issue where sharp does not release the file lock!
        fs.readFile(filePath, (err, data) => {
            if (err) {
                outputter.error("Error reading file " + filePath, err);
                throw err;
            } else {
                sharp(data)
                    .resize(MAX_DIMENSION)
                    .toFile(outPath, (sharpError: any) => {
                        if (sharpError) {
                            outputter.error("Error resizing file " + filePath, sharpError);
                            cb(null, sharpError);
                        }

                        return outPath;
                    });
            }
        });
    }
}
