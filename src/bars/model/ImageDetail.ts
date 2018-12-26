import * as path from "path";

import { ImageFilePath } from "./ImageFilePath";

export class ImageDetail {
    static fromImageFilePath(path: ImageFilePath): ImageDetail {
        return new ImageDetail(path.originalFilepath, path.smallerFilepath);
    }

    constructor(readonly originalFilepath: string, readonly smallerFilepath: string) {}

    get filename(): string {
        return path.basename(this.originalFilepath);
    }

    // TODO xxx add file size, width, height, exif and histogram
}
