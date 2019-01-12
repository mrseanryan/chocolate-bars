import * as fs from "fs";
import * as path from "path";

import { DataStorage } from "../bars/model/persisted/DataStorage";

export enum MoveOrCopy {
    Copy,
    Move
}

export namespace ImageMover {
    export async function moveStarredImagesTo(
        currentImageInputDir: string,
        directoryPath: string,
        mode: MoveOrCopy
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

                switch (mode) {
                    case MoveOrCopy.Copy:
                        fs.copyFile(imagePath, newPath, error => {
                            if (error) {
                                console.error(error);
                                hasErrors = true;
                            }

                            if (index === imagePaths.length - 1) {
                                done();
                            }
                        });
                        break;
                    case MoveOrCopy.Move:
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
                        break;
                    default:
                        throw new Error(`unhandled mode '${mode}'`);
                }
            });
        });
    }
}
