import * as child_process from "child_process";
import { IOutputter } from "./outputter/IOutputter";
import { ShrinkResultSerDe } from "./ShrinkResultSerDe";
import { ImageFilePath } from "../bars/model/ImageFilePath";

export namespace ImageResizeExectutor {
    export function resizeImagesAt(
        imagesDirectory: string,
        outputter: IOutputter
    ): ImageFilePath[] {
        const uint8array = child_process.execFileSync("node", [
            "./dist/lib/main.js",
            imagesDirectory,
            "--shrink"
        ]);

        var stdout = new TextDecoder("utf-8").decode((uint8array as any) as ArrayBuffer);

        return ShrinkResultSerDe.read(stdout, outputter);
    }
}
