export class ExifTagSet {
    static fromTags(tags: any, name: string): ExifTagSet | null {
        if (!tags) {
            return null;
        }

        const interestingTags = Object.keys(ExifTag);

        const tagSet = new ExifTagSet(name);

        interestingTags.forEach(tag => {
            const value = tags[tag] ? tags[tag] : null;

            if (value) {
                tagSet.map.set(tag as ExifTag, value);
            }
        });

        return tagSet;
    }

    readonly map = new Map<ExifTag, string>();

    constructor(readonly title: string) {}

    get(tag: ExifTag): string | null {
        if (!this.map.has(tag)) {
            return null;
        }

        return this.map.get(tag)!;
    }

    has(tag: ExifTag): boolean {
        return !!this.map.has(tag);
    }
}

export enum ExifTag {
    // 'exif'
    ApertureValue = "ApertureValue",
    BrightnessValue = "BrightnessValue",
    FNumber = "FNumber",
    Flash = "Flash",
    FocalLength = "FocalLength",
    ISO = "ISO",
    // 'gps'
    GPSAltitude = "GPSAltitude",
    GPSAltitudeRef = "GPSAltitudeRef",
    GPSLatitude = "GPSLatitude",
    GPSLatitudeRef = "GPSLatitudeRef",
    // 'image'
    ModifyDate = "ModifyDate",
    Orientation = "Orientation",
    Software = "Software",
    XResolution = "XResolution",
    YResolution = "YResolution",
    Make = "Make",
    Model = "Model"
}
