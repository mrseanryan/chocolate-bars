import * as jquery from "jquery";
import { ConsoleOutputter } from "../utils/outputter/ConsoleOutputter";
import { ChocolateBars } from "../bars/ChocolateBars";
import { ImageDetail } from "../bars/model/ImageDetail";
const remote = require("electron").remote;

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.onload = () => {
    const args = remote.getGlobal("sharedObject").prop1;

    const imageInputDir = args[2];

    const outputter = new ConsoleOutputter();

    ChocolateBars.processDirectory(imageInputDir, outputter)
        .then(result => {
            console.log("images!", result);

            // TODO xxx display text results

            result.imageDetails.forEach(image => {
                jquery(`#content`).prepend(renderImage(image));
            });
        })
        .catch(error => outputter.error(error));
};

function renderImage(image: ImageDetail): string {
    return `<img src="${image.smallerFilepath}" width="250px" />`;
}
