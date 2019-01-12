import { ImageResizeExecutor } from "../utils/ImageResizeExecutor";
import { IOutputter } from "../utils/outputter/IOutputter";
import { ChocolateResult } from "./model/ChocolateResult";
import { ImageDetail } from "./model/ImageDetail";
import { ImageFilePath } from "./model/ImageFilePath";

export namespace ChocolateBars {
    // Yield image results as they become available
    export async function* processDirectoryIterable(
        imageInputDir: string,
        enableSubDirs: boolean,
        outputter: IOutputter,
        currentPage: number
    ): AsyncIterableIterator<ChocolateResult> {
        // shrink if needed, and use that path (also keep original path)
        const iterable = ImageResizeExecutor.resizeImagesAtIterable(
            imageInputDir,
            enableSubDirs,
            outputter,
            currentPage
        );

        let id = 0;
        for await (const result of iterable) {
            outputter.infoVerbose(`yield results for image at ${[result.originalFilepath]}`);

            const imageDetail = ImageDetail.fromImageFilePath(id.toString(), result);

            yield {
                imageDetails: [imageDetail],
                isOk: true
            };

            id++;
        }
    }
}
