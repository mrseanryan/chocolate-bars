import * as child_process from "child_process";
import * as path from "path";

import { ImageFinder } from "../bars/files/ImageFinder";
import { ImageFilePath } from "../bars/model/ImageFilePath";
import { State } from "../electronApp/State";
import { FileUtils } from "./FileUtils";
import { IOutputter } from "./outputter/IOutputter";
import { SharedDataUtils } from "./SharedDataUtils";
import { ShrinkResultSerDe } from "./ShrinkResultSerDe";

// Execute shrinking via sharp in separate process, to avoid issues with Sharp + Electron in same process (C++ build)
export namespace ImageResizeExecutor {
    export async function* resizeImagesAtIterable(
        imagesDirectory: string,
        state: State,
        outputter: IOutputter
    ): AsyncIterableIterator<ImageFilePath> {
        outputter.infoVerbose(`finding images at ${imagesDirectory}...`);
        const filesThisPage = await ImageFinder.findImagesInDirectoryAtPage(
            imagesDirectory,
            state,
            outputter
        );

        for (const file of filesThisPage) {
            if (!FileUtils.isLargeFile(file)) {
                yield {
                    originalFilepath: file,
                    smallerFilepath: file
                };
                continue;
            }
            if (FileUtils.isSmallerFileNewer(file)) {
                const smallerFilepath = FileUtils.getSmallerFilePath(file);
                outputter.infoVerbose(`using cached resized image at ${smallerFilepath}...`);

                yield {
                    originalFilepath: file,
                    smallerFilepath
                };
                continue;
            }
            outputter.infoVerbose(`resizing image at ${file}...`);

            const stdout = await execShrinkPromise(file, outputter);

            outputter.infoVerbose(`resized image at ${file}.`);

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

    async function execShrinkPromise(filePath: string, outputter: IOutputter): Promise<string> {
        // determine path, whether running locally in repo OR globally as cli:
        // dist/lib/electronApp
        const thisScriptDir = path.dirname(SharedDataUtils.getArgs().thisScriptDir);

        const scriptToRun = path.resolve(path.join(thisScriptDir, "..", "main.js"));

        outputter.infoVerbose(`resizing image via ${scriptToRun}...`);

        return new Promise<string>((resolve, reject) => {
            child_process.execFile(
                "node",
                // .. to reach dist/lib
                [scriptToRun, `--imageDir=${filePath}`, "--shrink"],
                (err, stdout, stderr) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }

                    if (stderr) {
                        console.error(stderr);
                        reject(stderr);
                        return;
                    }

                    resolve(stdout);
                }
            );
        });
    }
}
