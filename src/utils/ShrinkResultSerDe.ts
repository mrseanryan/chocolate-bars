import { ImageFilePath } from "../bars/model/ImageFilePath";
import { IOutputter } from "./outputter/IOutputter";
import { StringUtils } from "./StringUtils";

const INTER_SEPARATOR = "-->";

export namespace ShrinkResultSerDe {
    export function write(filepath: string, smallerFilePath: string, outputter: IOutputter) {
        outputter.info(`${filepath} ${INTER_SEPARATOR} ${smallerFilePath}`);
    }

    export function read(stdout: string, outputter: IOutputter): ImageFilePath[] {
        /* example:

        "*shrink* images at ./static/testData/goodQuality ...
[ 'C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\flower-631765_960_720.jpg --> C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\flower-631765_960_720.jpg' ]
[ 'C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\House_sparrow04.jpg --> C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\House_sparrow04.jpg' ]
[ 'C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\marguerite-daisy-beautiful-beauty.jpg --> C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\marguerite-daisy-beautiful-beauty.jpg' ]
[ 'C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\P1000935-fullmar_800x600.JPG --> C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\P1000935-fullmar_800x600.JPG' ]
[ 'C:\\sean\\github\\mrseanryan\\chocolate-bars\\static\\testData\\goodQuality\\nature-bird-flying-red.jpg --> C:\\Users\\str_i\\AppData\\Local\\Temp\\nature-bird-flying-red.jpg.resized.jpg' ]
"
        */

        const prelimParts = stdout.split("...");
        prelimParts.shift();
        const withoutPrelim = prelimParts.join("...");

        const parts = withoutPrelim.split("[");

        const results: ImageFilePath[] = [];

        parts.forEach(part => {
            if (part.indexOf(INTER_SEPARATOR) > 0) {
                const imagePaths = part.split(INTER_SEPARATOR);

                if (imagePaths.length === 2) {
                    results.push({
                        originalFilepath: cleanUpFilePath(imagePaths[0]),
                        smallerFilepath: cleanUpFilePath(imagePaths[1])
                    });
                } else {
                    outputter.error(`unexpected stdout - error parsing`);
                }
            }
        });

        return results;
    }

    function cleanUpFilePath(imagePath: string): string {
        let cleanedPath = StringUtils.replaceAll(imagePath, "//", "/");
        cleanedPath = StringUtils.replaceAll(cleanedPath, "'", "");
        cleanedPath = StringUtils.replaceAll(cleanedPath, "]", "");
        cleanedPath = StringUtils.replaceAll(cleanedPath, "39m", "");

        return cleanedPath.trim();
    }
}
