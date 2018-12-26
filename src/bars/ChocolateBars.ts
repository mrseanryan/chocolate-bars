import { ChocolateResult } from "./model/ChocolateResult";

import { IOutputter } from "../utils/outputter/IOutputter";
import { ImageResizeExectutor } from "../utils/ImageResizeExecutor";
import { ImageFilePath } from "./model/ImageFilePath";

export namespace ChocolateBars {
    export async function processDirectory(
        imageInputDir: string,
        outputter: IOutputter
    ): Promise<ChocolateResult> {
        // shrink if needed, and use that path (also keep original path)
        const smallerFiles = await getSmallerFiles(imageInputDir, outputter);

        // TODO xxx get size MB, width, height

        // TODO xxx get exif tags

        return {
            isOk: true,
            imageDetails: smallerFiles
        };
    }

    async function getSmallerFiles(
        imageInputDir: string,
        outputter: IOutputter
    ): Promise<ImageFilePath[]> {
        const iterable = ImageResizeExectutor.resizeImagesAtIterable(imageInputDir, outputter);

        const results: ImageFilePath[] = [];
        for await (const result of iterable) {
            results.push(result);
        }
        return results;
    }

    // Yield image results as they become available
    export async function* processDirectoryIterable(
        imageInputDir: string,
        outputter: IOutputter
    ): AsyncIterableIterator<ChocolateResult> {
        // shrink if needed, and use that path (also keep original path)
        const iterable = ImageResizeExectutor.resizeImagesAtIterable(imageInputDir, outputter);

        for await (const result of iterable) {
            // TODO xxx get size MB, width, height

            // TODO xxx get exif tags

            outputter.infoVerbose(`yield results for image at ${[result.originalFilepath]}`);

            yield {
                imageDetails: [result],
                isOk: true
            };
        }
    }
}
