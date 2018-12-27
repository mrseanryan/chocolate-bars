"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process = require("child_process");
var path = require("path");
var ImageFinder_1 = require("./bars/files/ImageFinder");
var ImageResizer_1 = require("./bars/files/ImageResizer");
var ConsoleOutputter_1 = require("./utils/outputter/ConsoleOutputter");
var Verbosity_1 = require("./utils/outputter/Verbosity");
var ShrinkResultSerDe_1 = require("./utils/ShrinkResultSerDe");
var argv = require("yargs")
    .usage("Usage: $0 <path to image directory> [--shrink] [--verbose]")
    .demandCommand(1).argv;
var imageInputDir = argv._[0];
var shrink = !!argv.shrink;
var isVerbose = !!argv.verbose;
var outputter = new ConsoleOutputter_1.ConsoleOutputter(isVerbose ? Verbosity_1.Verbosity.High : Verbosity_1.Verbosity.Low);
if (shrink) {
    shrinkImagesAt();
}
else {
    launchChocolateBarsApp();
}
function shrinkImagesAt() {
    console.log("*shrink* images at " + imageInputDir + " ...");
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
// assumption: electron is globally installed
function launchChocolateBarsApp() {
    console.log("Launching chocolate bars of images at '" + imageInputDir + "' ...");
    var showElectronTip = function () {
        console.error("note: electron must be globally installed:");
        console.error("  npm i -g electron");
    };
    try {
        var appPath = path.resolve(path.join(__dirname, "electronApp/appMain.js"));
        child_process.spawn("electron", [appPath, imageInputDir], { shell: true });
    }
    catch (error) {
        console.error("[error]", error);
        showElectronTip();
    }
}
//# sourceMappingURL=main.js.map