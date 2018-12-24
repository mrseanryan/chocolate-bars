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
        const results = ImageResizeExectutor.resizeImagesAt(imageInputDir, outputter);

        return results;
    }
}
