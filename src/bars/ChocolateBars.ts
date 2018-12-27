import { ImageResizeExectutor } from "../utils/ImageResizeExecutor";
import { IOutputter } from "../utils/outputter/IOutputter";
import { ChocolateResult } from "./model/ChocolateResult";
import { ImageDetail } from "./model/ImageDetail";
import { ImageFilePath } from "./model/ImageFilePath";

export namespace ChocolateBars {
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

        let id = 0;
        for await (const result of iterable) {
            // TODO xxx get size MB, width, height

            // TODO xxx get exif tags

            outputter.infoVerbose(`yield results for image at ${[result.originalFilepath]}`);

            yield {
                imageDetails: [ImageDetail.fromImageFilePath(id.toString(), result)],
                isOk: true
            };

            id++;
        }
    }
}
