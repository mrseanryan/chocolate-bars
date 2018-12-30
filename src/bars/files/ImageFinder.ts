import * as fs from "fs";
import * as path from "path";

import { FileUtils } from "../../utils/FileUtils";
import { IOutputter } from "../../utils/outputter/IOutputter";

export namespace ImageFinder {
    export const RECOGNISED_EXTENSIONS = [".jpg", ".jpeg"];

    export async function findImagesInDirectory(
        imageInputDirOrFile: string,
        outputter: IOutputter
    ): Promise<string[]> {
        if (
            !isDirectoryOrNotEnoughPermissions(imageInputDirOrFile) &&
            isFileExtensionOk(imageInputDirOrFile)
        ) {
            return [imageInputDirOrFile];
        }

        const readdirPromise = () => {
            return new Promise<string[]>(function(ok, notOk) {
                fs.readdir(imageInputDirOrFile, function(err, _files) {
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
            return [];
        }

        const absoluteFilePaths = files.map(f => {
            return path.resolve(path.join(imageInputDirOrFile, f));
        });

        const imageFilePaths = filterToImages(absoluteFilePaths, outputter);

        imageFilePaths.sort(bySizeAscending);

        return imageFilePaths;
    }

    function bySizeAscending(one: string, two: string): number {
        const bySize = (filePath: string): number => {
            return FileUtils.isLargeFile(filePath) ? 100000 : 0;
        };

        const byNameAscending = (): number => {
            return path.basename(one).localeCompare(path.basename(two));
        };

        return bySize(one) - bySize(two) + byNameAscending();
    }

    function filterToImages(filePaths: string[], outputter: IOutputter): string[] {
        return filePaths.filter(imagePath => {
            if (isDirectoryOrNotEnoughPermissions(imagePath) || !isFileExtensionOk(imagePath)) {
                outputter.warn(
                    `\nskipping file ${imagePath} (is dir or not enough permissions or a skipped file extension)`
                );

                return false;
            }
            return true;
        });
    }

    const isFileExtensionOk = (filepath: string) => {
        if (filepath.endsWith(".dropbox")) {
            return false;
        }

        // extensions - works for files with something before the '.'
        const ext = path.extname(filepath);

        return RECOGNISED_EXTENSIONS.some(goodExt => goodExt.toLowerCase() === ext.toLowerCase());
    };

    const isDirectoryOrNotEnoughPermissions = (filepath: string) => {
        try {
            return fs.lstatSync(filepath).isDirectory();
        } catch (error) {
            // can occur if not enough permissions, or file is already in use
            console.error(error);
            return true;
        }
    };
}
