import * as fs from "fs";
import * as path from "path";
import { IOutputter } from "../../utils/outputter/IOutputter";

export namespace ImageFinder {
    export async function findImagesInDirectory(
        imageInputDir: string,
        outputter: IOutputter
    ): Promise<string[]> {
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
            return [];
        }

        const absoluteFilePaths = files.map(f => {
            return path.resolve(path.join(imageInputDir, f));
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
