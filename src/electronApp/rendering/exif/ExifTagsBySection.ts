import { ExifTag } from "./ExifTag";

export namespace ExifTagsBySection {
    export function getTagsBySection(): Map<string, ExifTag[]> {
        const map = new Map<string, ExifTag[]>();

        map.set("Image", getImageTags());
        map.set("Device", getDeviceTags());
        map.set("GPS", getGpsTags());
        map.set("Other", getOtherTags(map));

        return map;
    }

    function getImageTags(): ExifTag[] {
        return [
            ExifTag.ColorSpace,
            ExifTag.DateTime,
            ExifTag.Orientation,
            ExifTag.ResolutionUnit,
            ExifTag.XResolution,
            ExifTag.YResolution
        ];
    }

    function getDeviceTags(): ExifTag[] {
        return [
            ExifTag.ApertureValue,
            ExifTag.DigitalZoomRatio,
            ExifTag.ExposureTime,
            ExifTag.FNumber,
            ExifTag.Flash,
            ExifTag.FocalLength,
            ExifTag.FocalLengthIn35mmFormat,
            ExifTag.ISOSpeedRatings,
            ExifTag.ShutterSpeedValue
        ];
    }

    function getGpsTags(): ExifTag[] {
        return [
            ExifTag.GPSAltitude,
            ExifTag.GPSAltitudeRef,
            ExifTag.GPSDateStamp,
            ExifTag.GPSLatitude,
            ExifTag.GPSLatitudeRef,
            ExifTag.GPSLongitude,
            ExifTag.GPSLongitudeRef
        ];
    }

    function getOtherTags(map: Map<string, ExifTag[]>): ExifTag[] {
        const allTags = Object.keys(ExifTag);

        const otherTags: ExifTag[] = [];

        allTags.forEach(tag => {
            let isTagUsed = false;
            map.forEach(value => {
                isTagUsed = isTagUsed || value.some(val => val === tag);
            });

            if (!isTagUsed) {
                otherTags.push(tag as ExifTag);
            }
        });

        return otherTags;
    }
}
