import * as jquery from "jquery";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { ChocolateBars } from "../bars/ChocolateBars";
import { ImageDetail } from "../bars/model/ImageDetail";
import { IOutputter } from "../utils/outputter/IOutputter";
import { Verbosity } from "../utils/outputter/Verbosity";
const remote = require("electron").remote;

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.onload = () => {
    const args = remote.getGlobal("sharedObject").prop1;

    const imageInputDir = args[2];

    const outputter = new ConsoleOutputter(Verbosity.High);

    setTimeout(() => {
        renderImages(imageInputDir, outputter);
    }, 0);
};

async function renderImages(imageInputDir: string, outputter: IOutputter) {
    for await (const result of ChocolateBars.processDirectoryIterable(imageInputDir, outputter)) {
        outputter.infoVerbose(`rendering ${result.imageDetails.length} images`);
        if (result.imageDetails.length > 0) {
            outputter.infoVerbose(`first = ${result.imageDetails[0].originalFilepath}`);
        }

        // TODO xxx display text results

        result.imageDetails.forEach(image => {
            jquery(`#content`).prepend(renderImage(image));
        });
    }
}

function renderImage(image: ImageDetail): string {
    return `<img src="${image.smallerFilepath}" width="250px" />`;
}
