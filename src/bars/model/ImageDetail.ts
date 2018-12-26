import * as path from "path";

import { ImageFilePath } from "./ImageFilePath";

export class ImageDetail {
    static fromImageFilePath(id: string, filePath: ImageFilePath): ImageDetail {
        return new ImageDetail(id, filePath.originalFilepath, filePath.smallerFilepath);
    }

    constructor(
        readonly id: string,
        readonly originalFilepath: string,
        readonly smallerFilepath: string
    ) {}

    get filename(): string {
        return path.basename(this.originalFilepath);
    }

    // TODO xxx add file size, width, height, exif
}
