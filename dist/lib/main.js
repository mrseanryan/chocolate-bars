"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process = require("child_process");
var clc = require("cli-color");
var fs_extra_1 = require("fs-extra");
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
var errorStyle = clc.black.bgRed;
var normalStyle = clc.green;
var successStyle = clc.black.bgGreen;
var warningStyle = clc.black.bgYellow;
var outputter = new ConsoleOutputter_1.ConsoleOutputter(isVerbose ? Verbosity_1.Verbosity.High : Verbosity_1.Verbosity.Low);
if (shrink) {
    shrinkImagesAt();
}
else {
    launchChocolateBarsApp();
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
// assumption: electron is globally installed
function launchChocolateBarsApp() {
    console.log(normalStyle("Launching chocolate bars of images at '" + imageInputDir + "' ..."));
    var showElectronTip = function () {
        console.error("note: electron must be globally installed:");
        console.error("  npm i -g electron");
    };
    try {
        var electronPathWhenGloballyInstalled = path.join(__dirname, "electron");
        var electronPathWhenRunFromSource = "./node_modules/.bin/electron";
        var electronPath = "";
        if (fs_extra_1.pathExistsSync(electronPathWhenGloballyInstalled)) {
            electronPath = electronPathWhenGloballyInstalled;
        }
        else if (fs_extra_1.pathExistsSync(electronPathWhenRunFromSource)) {
            electronPath = electronPathWhenRunFromSource;
        }
        else {
            throw new Error("Cannot locate electron at '" + electronPathWhenGloballyInstalled + "' or at '" + electronPathWhenRunFromSource + "'");
        }
        var appPath = path.resolve(path.join(__dirname, "electronApp/appMain.js"));
        // const electron =
        // child_process.execFileSync(path.resolve(electronPath), [appPath, imageInputDir]);
        child_process.spawn("electron", [appPath, imageInputDir], { shell: true });
        // child_process.execFileSync(
        //     path.resolve(electronPath),
        //     [appPath, imageInputDir]
        //     , {
        //     stdio: ["inherit", "inherit", "pipe", "ipc"]
        // }
        // );
        // electron..stderr.on("data", (chunk: any) => {
        //     // if (!chunk.toString("utf8").match(/^\[\d+:\d+/)) {
        //     process.stderr.write(chunk);
        //     // }
        // });
        // electron..on("error", function(err) {
        //     console.error("error running electron: " + err);
        //     showElectronTip();
        // });
    }
    catch (error) {
        console.error(errorStyle("[error]", error));
        showElectronTip();
    }
}
//# sourceMappingURL=main.js.map