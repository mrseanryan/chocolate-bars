import * as fs from "fs";

import { ImageDetail } from "../ImageDetail";
import { DirectoryMetaData } from "./DirectoryMetaData";

export namespace DataStorage {
    export async function loadForDirectoryOrCreate(imageInputDir: string) {
        if (fs.existsSync(imageInputDir)) {
            currentMetaData = await loadForDirectory(imageInputDir);
            return;
        }

        currentMetaData = {
            starredImageFilenames: []
        };
    }

    async function loadForDirectory(imageInputDir: string): Promise<DirectoryMetaData> {
        // TODO xxx
        return {
            starredImageFilenames: []
        };
    }

    export async function saveForDirectory(
        imageInputDir: string,
        data: DirectoryMetaData
    ): Promise<void> {
        // TODO xxx
    }

    export function toggleStarredImage(image: ImageDetail) {
        if (currentMetaData) {
            const index = currentMetaData.starredImageFilenames.findIndex(
                i => i === image.filename
            );
            if (index >= 0) {
                currentMetaData.starredImageFilenames.splice(index, 1);
            } else {
                currentMetaData.starredImageFilenames.push(image.filename);
            }

            image.isStarred = index === -1;
        }
    }

    export let currentMetaData: DirectoryMetaData | null = null;
}
