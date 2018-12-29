import * as fs from "fs";
import * as path from "path";

import { ImageDetail } from "../ImageDetail";
import { DirectoryMetaData } from "./DirectoryMetaData";

export namespace DataStorage {
    export async function loadForDirectoryOrCreate(imageInputDir: string) {
        if (fs.existsSync(getDataFilePathForDirectory(imageInputDir))) {
            try {
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
            fs.readFile(filepath, "utf8", (error, data) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }

                try {
                    resolve(JSON.parse(data));
                } catch (parseError) {
                    console.error("error parsing the JSON", parseError);
                    reject(parseError);
                }
            });
        });
    }

    export function getPathsOfStarredImages(currentImageInputDir: string): string[] {
        if (!currentMetaData) {
            return [];
        }

        return currentMetaData.starredImageFilenames.map(filename =>
            path.resolve(path.join(currentImageInputDir, filename))
        );
    }

    export function setImageAsNoStar(originalImagePath: string) {
        if (!currentMetaData) {
            throw new Error("No meta data!");
        }

        const filename = path.basename(originalImagePath);
        const index = getIndexOfStarredImageFilename(filename);

        if (index < 0) {
            throw new Error(`Cannot find image in store - '${filename}'`);
        }

        currentMetaData.starredImageFilenames.splice(index, 1);
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
                currentMetaData.starredImageFilenames.push(image.filename);
            }

            image.isStarred = index === -1;
        }
    }

    function getIndexOfStarredImage(image: ImageDetail): number {
        return getIndexOfStarredImageFilename(image.filename);
    }

    function getIndexOfStarredImageFilename(imageFilename: string): number {
        if (!currentMetaData) {
            return -1;
        }

        return currentMetaData.starredImageFilenames.findIndex(i => i === imageFilename);
    }

    function isImageStarred(image: ImageDetail): boolean {
        return getIndexOfStarredImage(image) >= 0;
    }

    export let currentMetaData: DirectoryMetaData | null = null;
}
