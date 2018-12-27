"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clc = require("cli-color");
var ChocolateBars_1 = require("./bars/ChocolateBars");
var ImageResizer_1 = require("./bars/files/ImageResizer");
var ConsoleOutputter_1 = require("./utils/outputter/ConsoleOutputter");
var ImageFinder_1 = require("./bars/files/ImageFinder");
var ShrinkResultSerDe_1 = require("./utils/ShrinkResultSerDe");
var Verbosity_1 = require("./utils/outputter/Verbosity");
var argv = require("yargs")
    .usage("Usage: $0 <path to image directory> [--shrink] [--verbose]")
    .demandCommand(1).argv;
var imageInputDir = argv._[0];
var shrink = !!argv.shrink;
var isVerbose = !!argv.verbose;
var errorStyle = clc.black.bgRed;
var normalStyle = clc.green;
var successStyle = clc.black.bgGreen;
var warningStyle = clc.black.bgYellow;
var outputter = new ConsoleOutputter_1.ConsoleOutputter(isVerbose ? Verbosity_1.Verbosity.High : Verbosity_1.Verbosity.Low);
if (shrink) {
    shrinkImagesAt();
}
else {
    getChocolateBarsAt();
}
function shrinkImagesAt() {
    console.log(normalStyle("*shrink* images at " + imageInputDir + " ..."));
    ImageFinder_1.ImageFinder.findImagesInDirectory(imageInputDir, outputter)
        .then(function (files) {
        files.forEach(function (file) {
            ImageResizer_1.ImageResizer.resizeImage(file, outputter)
                .then(function (smallerFilePath) {
                ShrinkResultSerDe_1.ShrinkResultSerDe.write(file, smallerFilePath, outputter);
            })
                .catch(function (error) { return outputter.error(error); });
        });
    })
        .catch(function (error) { return outputter.error(error); });
}
function getChocolateBarsAt() {
    console.log(normalStyle("Get chocolate bars of images at '" + imageInputDir + "' ..."));
    try {
        ChocolateBars_1.ChocolateBars.processDirectory(imageInputDir, outputter)
            .then(function (result) {
            if (result.isOk) {
                console.log(successStyle(result));
            }
            else {
                console.warn(warningStyle(result));
            }
        })
            .catch(function (error) {
            throw error;
        });
    }
    catch (error) {
        console.error(errorStyle("[error]", error));
    }
}
//# sourceMappingURL=main.js.map