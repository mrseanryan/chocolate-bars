import * as fs from "fs";

import { FileUtils } from "../../utils/FileUtils";
import { IOutputter } from "../../utils/outputter/IOutputter";

const sharp = require("sharp");

const MAX_DIMENSION = 800;

export namespace ImageResizer {
    export async function resizeImage(filePath: string, outputter: IOutputter): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!FileUtils.isLargeFile(filePath)) {
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

    // ref: https://github.com/lovell/sharp
    function resizeImageCb(
        filePath: string,
        outputter: IOutputter,
        cb: (outPath: string | null, err: any) => void
    ) {
        const outPath = FileUtils.getSmallerFilePath(filePath);

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

                        cb(outPath, null);
                    });
            }
        });
    }
}
