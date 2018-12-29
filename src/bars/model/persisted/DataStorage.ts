import * as fs from "fs";
import * as path from "path";

import { ImageDetail } from "../ImageDetail";
import { DirectoryMetaData } from "./DirectoryMetaData";

export namespace DataStorage {
    export async function loadForDirectoryOrCreate(imageInputDir: string) {
        if (fs.existsSync(getDataFilePathForDirectory(imageInputDir))) {
            currentMetaData = await loadForDirectory(imageInputDir);
            return;
        }

        currentMetaData = {
            starredImageFilenames: []
        };
    }

    async function loadForDirectory(imageInputDir: string): Promise<DirectoryMetaData> {
        const filepath = getDataFilePathForDirectory(imageInputDir);

        return new Promise((resolve, reject) => {
            fs.readFile(filepath, "utf8", (error, data) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }

                resolve(JSON.parse(data));
            });
        });
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
        if (!currentMetaData) {
            return -1;
        }

        return currentMetaData.starredImageFilenames.findIndex(i => i === image.filename);
    }

    function isImageStarred(image: ImageDetail): boolean {
        return getIndexOfStarredImage(image) >= 0;
    }

    export let currentMetaData: DirectoryMetaData | null = null;
}
