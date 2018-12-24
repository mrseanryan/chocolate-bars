import { ChocolateResult } from "./model/ChocolateResult";
import * as fs from "fs";
import * as path from "path";

import { IOutputter } from "../utils/outputter/IOutputter";
import { ImageDetail } from "./model/ImageDetail";
export namespace ChocolateBars {
    export function processDirectorySync(imageInputDir: string): ChocolateResult {
        // TODO xxx

        return {
            imageDetails: [],
            isOk: true
        };
    }

    export async function processDirectory(
        imageInputDir: string,
        outputter: IOutputter
    ): Promise<ChocolateResult> {
        const readdirPromise = () => {
            return new Promise<string[]>(function(ok, notOk) {
                fs.readdir(imageInputDir, function(err, _files) {
                    if (err) {
                        notOk(err);
                    } else {
                        ok(_files);
                    }
                });
            });
        };

        let files: string[];

        try {
            files = await readdirPromise();
        } catch (error) {
            outputter.error(error);
            return {
                imageDetails: [],
                isOk: false
            };
        }

        return {
            isOk: true,
            imageDetails: files
                .map(f => getImageDetail(f, imageInputDir, outputter))
                .filter(details => !!details) as ImageDetail[]
        };
    }

    function getImageDetail(
        imageFilename: string,
        imageInputDir: string,
        outputter: IOutputter
    ): ImageDetail | null {
        const imagePath = path.resolve(path.join(imageInputDir, imageFilename));

        if (isDirectory(imagePath) || !isFileExtensionOk(imagePath)) {
            outputter.warn(`\nskipping file ${imagePath} (is dir or a skipped file extension)`);

            return null;
        }

        // TODO xxx shrink via sharp and use that path (also keep original path)

        // TODO xxx get size MB, width, height

        // TODO xxx get exif tags

        return { imagePath: imagePath };
    }

    const isFileExtensionOk = (filepath: string) => {
        if (filepath.endsWith(".dropbox")) {
            return false;
        }

        // extensions - works for files with something before the '.'
        const ext = path.extname(filepath);
        const goodExtensions = [".jpg", ".jpeg"];

        return goodExtensions.some(goodExt => goodExt.toLowerCase() === ext.toLowerCase());
    };

    const isDirectory = (filepath: string) => {
        return fs.lstatSync(filepath).isDirectory();
    };
}
