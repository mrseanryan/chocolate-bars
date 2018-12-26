import * as clc from "cli-color";

import { ChocolateBars } from "./bars/ChocolateBars";
import { ImageResizer } from "./bars/files/ImageResizer";
import { ConsoleOutputter } from "./utils/outputter/ConsoleOutputter";
import { ImageFinder } from "./bars/files/ImageFinder";
import { ShrinkResultSerDe } from "./utils/ShrinkResultSerDe";
import { Verbosity } from "./utils/outputter/Verbosity";

const argv = require("yargs")
    .usage("Usage: $0 <path to image directory> [--shrink] [--verbose]")
    .demandCommand(1).argv;

const imageInputDir = argv._[0];

const shrink = !!argv.shrink;
const isVerbose = !!argv.verbose;

const errorStyle = clc.black.bgRed;
const normalStyle = clc.green;
const successStyle = clc.black.bgGreen;
const warningStyle = clc.black.bgYellow;

const outputter = new ConsoleOutputter(isVerbose ? Verbosity.High : Verbosity.Low);

if (shrink) {
    shrinkImagesAt();
} else {
    getChocolateBarsAt();
}

function shrinkImagesAt() {
    console.log(normalStyle(`*shrink* images at ${imageInputDir} ...`));

    ImageFinder.findImagesInDirectory(imageInputDir, outputter)
        .then(files => {
            files.forEach(file => {
                ImageResizer.resizeImage(file, outputter)
                    .then(smallerFilePath => {
                        ShrinkResultSerDe.write(file, smallerFilePath, outputter);
                    })
                    .catch(error => outputter.error(error));
            });
        })
        .catch(error => outputter.error(error));
}

function getChocolateBarsAt() {
    console.log(normalStyle(`Get chocolate bars of images at '${imageInputDir}' ...`));

    try {
        ChocolateBars.processDirectory(imageInputDir, outputter)
            .then(result => {
                if (result.isOk) {
                    console.log(successStyle(result));
                } else {
                    console.warn(warningStyle(result));
                }
            })
            .catch(error => {
                throw error;
            });
    } catch (error) {
        console.error(errorStyle("[error]", error));
    }
}
