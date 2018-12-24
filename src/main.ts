import * as clc from "cli-color";

import { ChocolateBar } from "./bar/ChocolateBar";

const argv = require("yargs")
    .usage("Usage: $0 <path to image directory>")
    .demandCommand(1).argv;

const pathToImageDir = argv._[0];

const errorStyle = clc.black.bgRed;
const normalStyle = clc.green;
const successStyle = clc.black.bgGreen;
const warningStyle = clc.black.bgYellow;

console.log(normalStyle(`Get chocolate bars of images at '${pathToImageDir}' ...`));

try {
    const result = ChocolateBar.processDirectory(pathToImageDir);

    if (result.isOk) {
        console.log(successStyle(result));
    } else {
        console.warn(warningStyle(result));
    }
} catch (error) {
    console.error(errorStyle("[error]", error));
}
