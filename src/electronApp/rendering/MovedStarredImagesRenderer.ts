import * as fs from "fs";
import * as path from "path";

import { DataStorage } from "../../bars/model/persisted/DataStorage";
import { DirectorySelector } from "../../utils/DirectorySelector";
import { State } from "../State";

export namespace MoveStarredImagesRenderer {
    export function getButtonHtml(): string {
        return `<button id="moveStarredButton">Move *...</button>`;
    }

    export function addMovedStarredListener(
        state: State,
        renderImagesAndPagerForDirectorySamePage: (imageInputDir: string) => void
    ) {
        const moveStarredButton = document.getElementById("moveStarredButton");

        if (!moveStarredButton) {
            throw new Error("could not find the 'move starred' button");
        }

        moveStarredButton.addEventListener("click", _ => {
            const directories = DirectorySelector.selectImagesDirectory(
                "Move starred images to directory",
                "Move images"
            );

            const imageInputDir = state.imageInputDir;

            if (directories && directories.length === 1) {
                moveStarredImagesTo(imageInputDir, directories[0])
                    .then(() => {
                        // refresh the current directory:
                        renderImagesAndPagerForDirectorySamePage(imageInputDir);
                    })
                    .catch((err: any) => {
                        console.error(err);

                        // some files may have moved OK - so refresh the current directory:
                        renderImagesAndPagerForDirectorySamePage(imageInputDir);
                    });
            }
        });
    }

    async function moveStarredImagesTo(
        currentImageInputDir: string,
        directoryPath: string
    ): Promise<void> {
        const imagePaths = DataStorage.getPathsOfStarredImages(currentImageInputDir);

        let hasErrors = false;

        return new Promise<void>((resolve, reject) => {
            const done = () => {
                if (hasErrors) {
                    reject("Some errors occurred when moving the files");
                } else {
                    resolve();
                }
            };

            imagePaths.forEach((imagePath, index) => {
                const fileName = path.basename(imagePath);
                const newPath = path.resolve(path.join(directoryPath, fileName));

                fs.rename(imagePath, newPath, error => {
                    if (error) {
                        console.error(error);
                        hasErrors = true;
                    } else {
                        DataStorage.setImageAsNoStar(imagePath);
                    }

                    if (index === imagePaths.length - 1) {
                        done();
                    }
                });
            });
        });
    }
}
