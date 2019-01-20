import { IOutputter } from "../../../utils/outputter/IOutputter";
import { ExifTag } from "./ExifTag";
import { ExifTagsBySection } from "./ExifTagsBySection";

const KNOWN_LATITUDE_FORMAT = "North latitude";
const KNOWN_LONGITUDE_FORMAT = "East longitude";

const DUMP_INDENT = "      ";

export class ExifTagSet {
    static fromTags(exifTags: any, outputter: IOutputter): ExifTagSet[] | null {
        if (!exifTags) {
            return null;
        }

        const tagSets: ExifTagSet[] = [];

        const tagsBySection = ExifTagsBySection.getTagsBySection();

        tagsBySection.forEach((tags, section) => {
            const tagSet = new ExifTagSet(section);

            tags.forEach(tag => {
                const value = exifTags[tag] ? exifTags[tag] : null;

                if (value !== undefined && value !== null) {
                    tagSet.map.set(tag as ExifTag, ExifTagSet.parseExifTagValue(tag, value));
                }
            });

            tagSet.dump(outputter);

            tagSets.push(tagSet);
        });

        return tagSets;
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
