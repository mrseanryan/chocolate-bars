import { Args, ArgsParser } from "./ArgsParser";

const remote = require("electron").remote;

export type ChocolateBarsArgs = Args & {
    thisScriptDir: string;
};

export namespace SharedDataUtils {
    export function getArgs(): ChocolateBarsArgs {
        const args = remote.getGlobal("sharedObject") as ChocolateBarsArgs;

        args.imageDir = ArgsParser.decodeSpaces(args.imageDir);

        return args;
    }
}
