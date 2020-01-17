import * as fs from "fs";
import * as path from "path";

import { ImageFinder } from "../bars/files/ImageFinder";
import { DataStorage } from "../bars/model/persisted/DataStorage";
import { State } from "../electronApp/State";
import { IOutputter } from "./outputter/IOutputter";

export enum MoveOrCopy {
    Copy,
    Move
}

export namespace MoveOrCopyUtils {
    export function toTextCapitalized(mode: MoveOrCopy): string {
        switch (mode) {
            case MoveOrCopy.Copy:
                return "Copy";
            case MoveOrCopy.Move:
                return "Move";
            default:
                throw new Error(`Unknown mode: ${mode}`);
        }
    }

    export function toTextPastTense(mode: MoveOrCopy): string {
        switch (mode) {
            case MoveOrCopy.Copy:
                return "copied";
            case MoveOrCopy.Move:
                return "moved";
            default:
                throw new Error(`Unknown mode: ${mode}`);
        }
    }
}

export namespace ImageMover {
    export async function moveStarredImagesTo(
        currentImageInputDir: string,
        directoryPath: string,
        mode: MoveOrCopy,
        state: State,
        outputter: IOutputter
    ): Promise<void> {
        const starredImagesThisPage = await getStarredImagesThisPage(
            currentImageInputDir,
            state,
            outputter
        );

        let hasErrors = false;

        return new Promise<void>((resolve, reject) => {
            const done = () => {
                if (hasErrors) {
                    reject("Some errors occurred when moving the files");
                } else {
                    resolve();
                }
            };

            if (starredImagesThisPage.length === 0) {
                reject("Please first add stars to some images");
            }

            starredImagesThisPage.forEach((imagePath, index) => {
                const fileName = path.basename(imagePath);
                const newPath = path.resolve(path.join(directoryPath, fileName));

                const callDoneForLast = (needToSaveStorage: boolean) => {
                    if (index === starredImagesThisPage.length - 1) {
                        if (!needToSaveStorage) {
                            done();
                        } else {
                            DataStorage.saveForCurrentDirectory()
                                .then(() => {
                                    done();
                                })
                                .catch(err => {
                                    console.error(err);
                                    done();
                                });
                        }
                    }
                };

                // Use *sync* methods so we only save after the *last* item
                switch (mode) {
                    case MoveOrCopy.Copy:
                        fs.copyFileSync(imagePath, newPath);
                        callDoneForLast(false);
                        break;
                    case MoveOrCopy.Move:
                        try {
                            fs.renameSync(imagePath, newPath);

                            // Need to save after setting as no star, since done will reload the stars.
                            DataStorage.setImageAsNoStar(imagePath);

                            callDoneForLast(true);
                        } catch (error) {
                            console.error(error);
                            callDoneForLast(false);
                        }

                        break;
                    default:
                        throw new Error(`unhandled mode '${mode}'`);
                }
            });
        });
    }

    async function getStarredImagesThisPage(
        currentImageInputDir: string,
        state: State,
        outputter: IOutputter
    ): Promise<string[]> {
        const imagePaths = DataStorage.getPathsOfStarredImages(currentImageInputDir);

        const imagesThisPage = await ImageFinder.findImagesInDirectoryAtPage(
            currentImageInputDir,
            state,
            outputter
        );

        return imagePaths.filter(imagePath =>
            imagesThisPage.some(imageThisPage => imageThisPage === imagePath)
        );
    }

    export async function hasStarredImagesThisPage(
        currentImageInputDir: string,
        state: State,
        outputter: IOutputter
    ): Promise<boolean> {
        const images = await getStarredImagesThisPage(currentImageInputDir, state, outputter);
        return images.length > 0;
    }
}
