import * as child_process from "child_process";
import * as path from "path";

import { ImageFinder } from "./bars/files/ImageFinder";
import { ImageResizer } from "./bars/files/ImageResizer";
import { ArgsParser } from "./utils/ArgsParser";
import { ConsoleOutputter } from "./utils/outputter/ConsoleOutputter";
import { Verbosity } from "./utils/outputter/Verbosity";
import { ShrinkResultSerDe } from "./utils/ShrinkResultSerDe";

const parsedArgs = ArgsParser.parse();

const outputter = new ConsoleOutputter(parsedArgs.isVerbose ? Verbosity.High : Verbosity.Low);

if (parsedArgs.shrink) {
    shrinkImagesAt();
} else {
    launchChocolateBarsApp();
}

function shrinkImagesAt() {
    console.log(`*shrink* images at ${parsedArgs.imageDir} ...`);

    ImageFinder.findImagesInDirectory(parsedArgs.imageDir, parsedArgs.subDirs, outputter)
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
    console.log(`Launching chocolate bars of images at '${parsedArgs.imageDir}' ...`);

    const showElectronTip = () => {
        console.error(`note: electron must be globally installed:`);
        console.error(`  npm i -g electron`);
    };

    try {
        const appPath = path.resolve(path.join(__dirname, "electronApp/appMain.js"));

        child_process.spawn(
            "electron",
            [
                // MUST align with SharedDataUtils.ts and ImageSizeExecutor.ts:
                appPath,
                parsedArgs.imageDir,
                boolAsString(parsedArgs.subDirs, "subDirs"),
                boolAsString(parsedArgs.isVerbose, "verbose")
            ],
            {
                shell: true
            }
        );
    } catch (error) {
        console.error("[error]", error);
        showElectronTip();
    }

    function boolAsString(val: boolean, argName: string): string {
        return val ? argName : `${argName}-disabled`;
    }
}
