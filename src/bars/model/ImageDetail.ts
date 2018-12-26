import * as path from "path";

import { ImageFilePath } from "./ImageFilePath";

export class ImageDetail {
    static fromImageFilePath(id: string, path: ImageFilePath): ImageDetail {
        return new ImageDetail(id, path.originalFilepath, path.smallerFilepath);
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
