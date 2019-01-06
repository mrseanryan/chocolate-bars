import * as jquery from "jquery";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { ExifOrientation, parseOrientationOrThrow } from "./exif/ExifOrientation";
import { ExifReader } from "./exif/ExifReader";
import { ExifTag } from "./exif/ExifTagSet";
import { HtmlGrid } from "./HtmlGrid";

enum Transformation {
    FlipVerticalAxis = "transform-flip-vertical-axis",
    Rotate180 = "transform-rotate-180",
    Rotate90 = "transform-rotate-90",
    RotateMinus90 = "transform-rotate-minus-90",
    Rotate180AndFlipVerticalAxis = "transform-rotate-180-and-flip-vertical-axis",
    Rotate90AndFlipHorizontalAxis = "transform-rotate-90-and-flip-horizontal-axis",
    RotateMinus90AndFlipHorizontalAxis = "transform-rotate-minus-90-and-flip-horizontal-axis"
}

export namespace ImageOrientationSetter {
    export async function setOrientation(image: ImageDetail) {
        try {
            if (!ExifReader.canFileHaveExif(image.originalFilepath)) {
                return;
            }

            const tagSets = await ExifReader.getExifTagsForImageAsync(image);

            if (!tagSets) {
                return;
            }

            const tagSetsWithOrientation = tagSets.filter(tagSet =>
                tagSet.has(ExifTag.Orientation)
            );

            if (tagSetsWithOrientation.length > 0) {
                const orientationText = tagSetsWithOrientation[0].get(ExifTag.Orientation)!;

                const orientation = parseOrientationOrThrow(orientationText);

                setOrientationTo(image, orientation);
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    function setOrientationTo(image: ImageDetail, orientation: ExifOrientation) {
        let cssClasses = "";

        switch (orientation) {
            case ExifOrientation.Normal:
                // do nothing
                return;
            case ExifOrientation.ReflectedVerticalAxis:
                cssClasses = Transformation.FlipVerticalAxis;
                break;
            case ExifOrientation.Rotated180:
                cssClasses = Transformation.Rotate180;
                break;
            case ExifOrientation.Rotated180AndReflectedVerticalAxis:
                cssClasses = Transformation.Rotate180AndFlipVerticalAxis;
                break;
            case ExifOrientation.Rotated270:
                cssClasses = Transformation.Rotate90;
                break;
            case ExifOrientation.Rotated270AndReflectedHorizontalAxis:
                cssClasses = Transformation.Rotate90AndFlipHorizontalAxis;
                break;
            case ExifOrientation.Rotated90:
                cssClasses = Transformation.RotateMinus90;
                break;
            case ExifOrientation.Rotated90AndReflectedHorizontalAxis:
                cssClasses = Transformation.RotateMinus90AndFlipHorizontalAxis;
                break;
            default:
                throw new Error(`unhandled orientation '${orientation}'`);
        }

        const divId = HtmlGrid.getImageDivId(image);
        const jqueryDiv = jquery(`#${divId}`);
        jqueryDiv.addClass(cssClasses);
    }
}
