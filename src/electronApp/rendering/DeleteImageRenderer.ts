import * as fs from "fs";

import { ImageDetail } from "../../bars/model/ImageDetail";
import { Prompter } from "./Prompter";

export namespace DeleteImageRenderer {
    export async function renderPrompt(imageToDelete: ImageDetail, afterDelete: () => void) {
        Prompter.prompt(
            "Delete",
            "Delete Image",
            "Do you want to delete this image? (cannot be undone)",
            () => {
                deleteImage(imageToDelete)
                    .then(() => {
                        afterDelete();
                    })
                    .catch((err: any) => {
                        console.error(err);
                    });
            }
        );
    }

    async function deleteImage(imageToDelete: ImageDetail) {
        return new Promise<void>((resolve, reject) => {
            fs.unlink(imageToDelete.originalFilepath, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
