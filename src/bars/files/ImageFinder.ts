import * as fs from "fs";
import * as path from "path";
import { IOutputter } from "../../utils/outputter/IOutputter";
import { Nodash } from "../../utils/Nodash";

// TODO xxx remove once have paging
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

        const absoluteFilePaths = Nodash.take(files, MAX_FILES).map(f => {
            return path.resolve(path.join(imageInputDirOrFile, f));
        });

        const imageFilePaths = filterToImages(absoluteFilePaths, outputter);

        return imageFilePaths;
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
