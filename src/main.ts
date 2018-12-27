import * as child_process from "child_process";
import * as path from "path";

import { ImageFinder } from "./bars/files/ImageFinder";
import { ImageResizer } from "./bars/files/ImageResizer";
import { ConsoleOutputter } from "./utils/outputter/ConsoleOutputter";
import { Verbosity } from "./utils/outputter/Verbosity";
import { ShrinkResultSerDe } from "./utils/ShrinkResultSerDe";

const argv = require("yargs")
    .usage("Usage: $0 <path to image directory> [--shrink] [--verbose]")
    .demandCommand(1).argv;

const imageInputDir = argv._[0];

const shrink = !!argv.shrink;
const isVerbose = !!argv.verbose;

const outputter = new ConsoleOutputter(isVerbose ? Verbosity.High : Verbosity.Low);

if (shrink) {
    shrinkImagesAt();
} else {
    launchChocolateBarsApp();
}

function shrinkImagesAt() {
    console.log(`*shrink* images at ${imageInputDir} ...`);

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

// assumption: electron is globally installed
function launchChocolateBarsApp() {
    console.log(`Launching chocolate bars of images at '${imageInputDir}' ...`);

    const showElectronTip = () => {
        console.error(`note: electron must be globally installed:`);
        console.error(`  npm i -g electron`);
    };

    try {
        const appPath = path.resolve(path.join(__dirname, "electronApp/appMain.js"));

        child_process.spawn("electron", [appPath, imageInputDir], { shell: true });
    } catch (error) {
        console.error("[error]", error);
        showElectronTip();
    }
}
