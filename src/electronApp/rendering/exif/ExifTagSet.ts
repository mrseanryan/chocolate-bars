import { IOutputter } from "../../../utils/outputter/IOutputter";

const KNOWN_LATITUDE_FORMAT = "North latitude";
const KNOWN_LONGITUDE_FORMAT = "East longitude";

const DUMP_INDENT = "      ";

export class ExifTagSet {
    static fromTags(tags: any, outputter: IOutputter): ExifTagSet | null {
        if (!tags) {
            return null;
        }

        console.log("xxx");
        console.dir(tags);

        const interestingTags = Object.keys(ExifTag);

        // TODO xxx divide tags into groups - like Image, Device, GPS
        const tagSet = new ExifTagSet("tags");

        interestingTags.forEach(tag => {
            const value = tags[tag] ? tags[tag] : null;

            if (value !== undefined && value !== null) {
                tagSet.map.set(tag as ExifTag, ExifTagSet.parseExifTagValue(tag, value));
            }
        });

        tagSet.dump(outputter);

        return tagSet;
    }

    private static parseExifTagValue(tag: string, tagValue: any): string {
        const value = tagValue.value;
        let description = tagValue.description;

        if (tag === ExifTag.ColorSpace && value === "1" && description === "1") {
            description = "sRGB";
        }

        if (tag === ExifTag.Flash) {
            return description;
        }

        if (description === value) {
            return description;
        }

        return `${value}(${description})`;
    }

    readonly map = new Map<ExifTag, string>();

    constructor(readonly title: string) {}

    dump(outputter: IOutputter) {
        this.map.forEach((value, key) => {
            this.dumpTag(key, value, outputter);
        });
        outputter.infoMediumVerbose(
            `${DUMP_INDENT}lat/longs`,
            this.isLatLongOk() ? "[ok]" : "[unknown format]"
        );
    }

    private dumpTag(tag: string, value: string, outputter: IOutputter) {
        outputter.infoMediumVerbose(`${DUMP_INDENT}${tag} = ${value}`);
    }

    get(tag: ExifTag): string | null {
        if (!this.map.has(tag)) {
            return null;
        }

        return this.map.get(tag)!;
    }

    has(tag: ExifTag): boolean {
        return !!this.map.has(tag);
    }

    isLatLongOk(): boolean {
        const lat = this.get(ExifTag.GPSLatitude);
        const long = this.get(ExifTag.GPSLongitude);

        return (
            lat !== null &&
            long !== null &&
            this.get(ExifTag.GPSLatitudeRef) === KNOWN_LATITUDE_FORMAT &&
            this.get(ExifTag.GPSLongitudeRef) === KNOWN_LONGITUDE_FORMAT
        );
    }
}

// Interesting subset of exif tags
export enum ExifTag {
    ApertureValue = "ApertureValue", // 1.53
    ColorSpace = "ColorSpace", // sRGB, 1 = sRGB
    DateTime = "DateTime", // 2018:07:15 16:57:48
    FocalLength = "FocalLength", // 4.2
    GPSAltitude = "GPSAltitude", // 51 m
    GPSAltitudeRef = "GPSAltitudeRef", // Sea level
    GPSDateStamp = "GPSDateStamp", // 2018:07:15
    GPSLatitude = "GPSLatitude", // 51.92166666666667
    GPSLatitudeRef = "GPSLatitudeRef", // North latitude
    GPSLongitude = "GPSLongitude", // 4.502777777777778
    GPSLongitudeRef = "GPSLongitudeRef", // East longitude
    ISOSpeedRatings = "ISOSpeedRatings", // 40
    Orientation = "Orientation", // right-top
    ShutterSpeedValue = "ShutterSpeedValue", // 7.05
    XResolution = "XResolution", // 72
    YResolution = "YResolution", // 72
    ResolutionUnit = "ResolutionUnit", // 2, inches,

    DigitalZoomRatio = "DigitalZoomRatio", // 1/1
    Flash = "Flash", // 0(Flash did not fire)
    // [object Object](Fired: False; Return: 0; Mode: 0; Function: False; RedEyeMode: False)
    FNumber = "FNumber", // 1.7, 4/1
    ExposureTime = "ExposureTime", // 0.007518796992481203, 1/1600
    FocalLengthIn35mmFormat = "FocalLengthIn35mmFormat",
    ISO = "ISO",
    SubjectDistance = "SubjectDistance" // 3/100
}
