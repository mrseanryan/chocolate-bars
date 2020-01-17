import { State } from "../electronApp/State";
import { ImageResizeExecutor } from "../utils/ImageResizeExecutor";
import { IOutputter } from "../utils/outputter/IOutputter";
import { ChocolateResult } from "./model/ChocolateResult";
import { ImageDetail } from "./model/ImageDetail";

export namespace ChocolateBars {
    // Yield image results as they become available
    export async function* processDirectoryIterable(
        imageInputDir: string,
        state: State,
        outputter: IOutputter
    ): AsyncIterableIterator<ChocolateResult> {
        // shrink if needed, and use that path (also keep original path)
        const iterable = ImageResizeExecutor.resizeImagesAtIterable(
            imageInputDir,
            state,
            outputter
        );

        // Possible issue:
        // How to handle directory that has images, but none of them successfully resize?
        //
        // - the iterable will be empty, so caller will never hide the 'loading' icon
        // Could always return an empty image? But maybe there is no nice way to handle this scenario.

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
