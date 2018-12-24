import * as clc from "cli-color";

import { ChocolateBars } from "./bars/ChocolateBars";

const argv = require("yargs")
    .usage("Usage: $0 <path to image directory>")
    .demandCommand(1).argv;

const imageInputDir = argv._[0];

const errorStyle = clc.black.bgRed;
const normalStyle = clc.green;
const successStyle = clc.black.bgGreen;
const warningStyle = clc.black.bgYellow;

console.log(normalStyle(`Get chocolate bars of images at '${imageInputDir}' ...`));

try {
    const result = ChocolateBars.processDirectorySync(imageInputDir);

    if (result.isOk) {
        console.log(successStyle(result));
    } else {
        console.warn(warningStyle(result));
    }
} catch (error) {
    console.error(errorStyle("[error]", error));
}
