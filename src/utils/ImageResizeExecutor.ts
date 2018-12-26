import * as child_process from "child_process";
import { IOutputter } from "./outputter/IOutputter";
import { ShrinkResultSerDe } from "./ShrinkResultSerDe";
import { ImageFilePath } from "../bars/model/ImageFilePath";
import { ImageFinder } from "../bars/files/ImageFinder";
import { FileUtils } from "./FileUtils";

// Execute shrinking via sharp in separate process, to avoid issues with Sharp + Electron in same process (C++ build)
export namespace ImageResizeExectutor {
    export async function* resizeImagesAtIterable(
        imagesDirectory: string,
        outputter: IOutputter
    ): AsyncIterableIterator<ImageFilePath> {
        outputter.infoVerbose(`finding images at ${imagesDirectory}...`);
        const files = await ImageFinder.findImagesInDirectory(imagesDirectory, outputter);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!FileUtils.isLargeFile(file)) {
                yield {
                    originalFilepath: file,
                    smallerFilepath: file
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

    async function execShrinkPromise(filePath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            child_process.execFile(
                "node",
                ["./dist/lib/main.js", filePath, "--shrink"],
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
