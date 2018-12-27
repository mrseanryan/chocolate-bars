import * as path from "path";

import { FileUtils } from "../../utils/FileUtils";
import { ImageDimensions } from "../files/ImageDimensions";
import { Dimensions } from "./Dimensions";
import { ImageFilePath } from "./ImageFilePath";

export class ImageDetail {
    static fromImageFilePath(id: string, filePath: ImageFilePath): ImageDetail {
        return new ImageDetail(
            id,
            filePath.originalFilepath,
            filePath.smallerFilepath,
            FileUtils.getFilesizeInMegaBytes(filePath.originalFilepath),
            ImageDimensions.getDimensions(filePath.originalFilepath)
        );
    }

    constructor(
        readonly id: string,
        readonly originalFilepath: string,
        readonly smallerFilepath: string,
        readonly fileSizeInMb: number,
        readonly dimensions: Dimensions
    ) {}

    get filename(): string {
        return path.basename(this.originalFilepath);
    }

    // TODO xxx add exif property bag
}
