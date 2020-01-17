import { Args, ArgsParser } from "./ArgsParser";

const remote = require("electron").remote;

export type ChocolateBarsArgs = Args & {
    thisScriptDir: string;
};

export namespace SharedDataUtils {
    export function getArgs(): ChocolateBarsArgs {
        const args = remote.getGlobal("sharedObject") as ChocolateBarsArgs;

        args.imageDir = ArgsParser.decodeSpaces(ensureIsString(args.imageDir));

        return args;
    }

    // With cli usage of '-i', the encoded imageDir appears twice, so we get an array
    function ensureIsString(imageDir: string | string[]): string {
        return Array.isArray(imageDir) ? imageDir[imageDir.length - 1] : imageDir;
    }
}
