import * as fs from "fs";
import * as path from "path";

import { FileUtils } from "../../utils/FileUtils";
import { Nodash } from "../../utils/Nodash";
import { IOutputter } from "../../utils/outputter/IOutputter";

// TODO xxx remove limit on file count, once have paging
const MAX_FILES = 100;

export namespace ImageFinder {
    export async function findImagesInDirectory(
        imageInputDirOrFile: string,
        outputter: IOutputter
    ): Promise<string[]> {
        if (!isDirectory(imageInputDirOrFile) && isFileExtensionOk(imageInputDirOrFile)) {
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

        return Nodash.take(imageFilePaths, MAX_FILES);
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
            if (isDirectory(imagePath) || !isFileExtensionOk(imagePath)) {
                outputter.warn(`\nskipping file ${imagePath} (is dir or a skipped file extension)`);

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
        const goodExtensions = [".jpg", ".jpeg"];

        return goodExtensions.some(goodExt => goodExt.toLowerCase() === ext.toLowerCase());
    };

    const isDirectory = (filepath: string) => {
        return fs.lstatSync(filepath).isDirectory();
    };
}
