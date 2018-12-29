import * as child_process from "child_process";
import * as path from "path";

import { ImageFinder } from "../bars/files/ImageFinder";
import { ImageFilePath } from "../bars/model/ImageFilePath";
import { PagingModel } from "../bars/model/PagingModel";
import { FileUtils } from "./FileUtils";
import { IOutputter } from "./outputter/IOutputter";
import { SharedDataUtils } from "./SharedDataUtils";
import { ShrinkResultSerDe } from "./ShrinkResultSerDe";

// Execute shrinking via sharp in separate process, to avoid issues with Sharp + Electron in same process (C++ build)
export namespace ImageResizeExecutor {
    export async function* resizeImagesAtIterable(
        imagesDirectory: string,
        outputter: IOutputter,
        currentPage: number = -1
    ): AsyncIterableIterator<ImageFilePath> {
        outputter.infoVerbose(`finding images at ${imagesDirectory}...`);
        const files = await ImageFinder.findImagesInDirectory(imagesDirectory, outputter);

        const filesThisPage = filterFilesForPage(files, currentPage);

        for (const file of filesThisPage) {
            if (!FileUtils.isLargeFile(file)) {
                yield {
                    originalFilepath: file,
                    smallerFilepath: file
                };
                continue;
            }
            if (FileUtils.isSmallerFileNewer(file)) {
                yield {
                    originalFilepath: file,
                    smallerFilepath: FileUtils.getSmallerFilePath(file)
                };
                continue;
            }
            outputter.infoVerbose(`resizing image at ${file}...`);

            const stdout = await execShrinkPromise(file);

            const stdoutText = stdout;

            try {
                const newFiles = ShrinkResultSerDe.read(stdoutText, outputter);

                if (newFiles.length !== 1) {
                    outputter.error(
                        `Expected results for 1 file but got ${newFiles.length} results`
                    );

                    outputter.error(`stdout`, stdoutText);
                    continue;
                }

                yield newFiles[0];
            } catch (error) {
                outputter.error(error);
                continue;
            }
        }
    }

    function filterFilesForPage(files: string[], currentPage: number): string[] {
        if (currentPage < 0) {
            return files;
        }

        const start = currentPage * PagingModel.IMAGES_PER_PAGE;

        const filesThisPage: string[] = [];
        for (let i = start; i < start + PagingModel.IMAGES_PER_PAGE && i < files.length; i++) {
            filesThisPage.push(files[i]);
        }

        return filesThisPage;
    }

    async function execShrinkPromise(filePath: string): Promise<string> {
        // determine path, whether running locally in repo OR globally as cli:
        // dist/lib/electronApp
        const thisScriptDir = path.dirname(SharedDataUtils.getArgs()[1]);

        return new Promise<string>((resolve, reject) => {
            child_process.execFile(
                "node",
                // .. to reach dist/lib
                [path.resolve(path.join(thisScriptDir, "..", "main.js")), filePath, "--shrink"],
                (err, stdout, stderr) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (stderr) {
                        reject(stderr);
                        return;
                    }

                    resolve(stdout);
                }
            );
        });
    }
}
