import * as fs from "fs";
import * as path from "path";

import { ImageDetail } from "../ImageDetail";
import { DirectoryMetaData } from "./DirectoryMetaData";

export namespace DataStorage {
    export async function loadForDirectoryOrCreate(imageInputDir: string) {
        if (fs.existsSync(getDataFilePathForDirectory(imageInputDir))) {
            try {
                currentImageInputDir = imageInputDir;
                currentMetaData = await loadForDirectory(imageInputDir);
            } catch (error) {
                console.error("error loading stars - will default to no stars", error);
                currentMetaData = getEmptyData();
            }
            return;
        }

        currentMetaData = getEmptyData();
    }

    function getEmptyData(): DirectoryMetaData {
        return {
            starredImageFilenames: []
        };
    }

    async function loadForDirectory(imageInputDir: string): Promise<DirectoryMetaData> {
        const filepath = getDataFilePathForDirectory(imageInputDir);

        return new Promise<DirectoryMetaData>((resolve, reject) => {
            const tryToReadFile = () => {
                attempts++;
                fs.readFile(filepath, "utf8", (error, data) => {
                    if (error) {
                        console.error(error);
                        retry(error);
                        return;
                    }

                    try {
                        const metaData = JSON.parse(data);
                        resolve(metaData);
                    } catch (parseError) {
                        console.warn("error parsing the JSON - will retry", parseError);
                        retry(parseError);
                    }
                });
            };

            const MAX_ATTEMPTS = 3;
            let attempts = 0;

            const retry = (error: any) => {
                if (attempts >= MAX_ATTEMPTS) {
                    console.error(
                        `tried ${MAX_ATTEMPTS} to read JSON - giving up - will default to empty stars`
                    );
                    reject(error);
                    return;
                }

                console.log("retrying after 1 second ...");
                setTimeout(() => tryToReadFile(), 1000);
            };

            tryToReadFile();
        });
    }

    export function getPathsOfStarredImages(imageInputDir: string): string[] {
        if (!currentMetaData) {
            return [];
        }

        return currentMetaData.starredImageFilenames.map(filename =>
            path.resolve(path.join(imageInputDir, filename))
        );
    }

    export function setImageAsNoStar(originalImagePath: string) {
        if (!currentMetaData) {
            throw new Error("No meta data!");
        }

        const index = getIndexOfStarredImageFilePath(originalImagePath);

        if (index < 0) {
            throw new Error(`Cannot find image in store - '${originalImagePath}'`);
        }

        currentMetaData.starredImageFilenames.splice(index, 1);
    }

    // Get the path to the image, from the input dir. Necessary for supporting sub-directories.
    export function getPathRelativeToInputDir(originalImagePath: string): string {
        // Get relative path from this dir
        const imageInputDirAbs = path.resolve(currentImageInputDir);
        const originalImagePathAbs = path.resolve(originalImagePath);

        if (!originalImagePathAbs.startsWith(imageInputDirAbs)) {
            console.error(
                `unexpected: image at '${originalImagePath}' is not under '${currentImageInputDir}'`
            );
            return originalImagePathAbs;
        }

        return originalImagePathAbs.substr(imageInputDirAbs.length);
    }

    export function getPathRelativeToInputDirNoLeadingSlash(originalImagePath: string): string {
        const relativePath = getPathRelativeToInputDir(originalImagePath);

        if (relativePath.startsWith("/") || relativePath.startsWith("\\")) {
            return relativePath.substr(1);
        }

        return relativePath;
    }

    export function updateImageDetail(image: ImageDetail) {
        image.isStarred = isImageStarred(image);
    }

    function getDataFilePathForDirectory(imageInputDir: string): string {
        const filepath = path.resolve(path.join(imageInputDir, "chocolate-bars.json"));

        return filepath;
    }

    export function saveForDirectorySync(imageInputDir: string) {
        saveForDirectory(imageInputDir)
            .then(() => {
                // do nothing
            })
            .catch(error => console.log(error));
    }

    export async function saveForDirectory(imageInputDir: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const data = currentMetaData;
                if (!data) {
                    throw new Error("cannot save - no current data!");
                }

                const filepath = getDataFilePathForDirectory(imageInputDir);

                const readableJson = JSON.stringify(data, null, 2);

                fs.writeFile(filepath, readableJson, "utf8", error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    export function toggleStarredImage(image: ImageDetail) {
        if (currentMetaData) {
            const index = getIndexOfStarredImage(image);
            if (index >= 0) {
                currentMetaData.starredImageFilenames.splice(index, 1);
            } else {
                currentMetaData.starredImageFilenames.push(
                    getPathRelativeToInputDir(image.originalFilepath)
                );
            }

            image.isStarred = index === -1;
        }
    }

    function getIndexOfStarredImage(image: ImageDetail): number {
        return getIndexOfStarredImageFilePath(image.originalFilepath);
    }

    function getIndexOfStarredImageFilePath(originalImageFilepath: string): number {
        if (!currentMetaData) {
            return -1;
        }

        const relatedPath = getPathRelativeToInputDir(originalImageFilepath);

        const index = currentMetaData.starredImageFilenames.findIndex(i => i === relatedPath);

        if (index === -1) {
            // legacy JSON file has just filename
            const filename = path.basename(originalImageFilepath);
            return currentMetaData.starredImageFilenames.findIndex(i => i === filename);
        }
        return index;
    }

    function isImageStarred(image: ImageDetail): boolean {
        return getIndexOfStarredImage(image) >= 0;
    }

    let currentImageInputDir: string = "";
    let currentMetaData: DirectoryMetaData | null = null;
}
