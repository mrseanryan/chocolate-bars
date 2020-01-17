import { existsSync } from "fs";

import { StringUtils } from "./StringUtils";

const yargs = require("yargs");

export type Args = {
    imageDir: string;
    subDirs: boolean;
    shrink: boolean;
    isVerbose: boolean;
};

export namespace ArgsParser {
    export function parse(): Args {
        const argv = yargs
            .options({
                imageDir: {
                    alias: "i",
                    type: "string",
                    default: getDefaultImageDirForOs(),
                    description:
                        "The folder containing images. Defaults to typical locations for your OS."
                },
                shrink: {
                    type: "boolean",
                    default: false,
                    description:
                        "Make shrunken copies of images in the given imageDir. This is an internal option that you do not normally need to use."
                },
                subdirs: {
                    alias: "s",
                    type: "boolean",
                    default: false,
                    description: "If true, then also show images from sub-folders."
                },
                verbose: {
                    alias: "v",
                    type: "boolean",
                    default: false,
                    description: "If true, then use verbose logging."
                }
            })
            .strict().argv;

        const imageDir = argv.imageDir || getDefaultImageDirForOs();

        return {
            imageDir,
            isVerbose: !!argv.verbose,
            shrink: !!argv.shrink,
            subDirs: !!argv.subDirs
        };
    }

    const SPACE_TOKEN = "__-32-__"; // avoid & or ; or ! which shell can act on

    export function encodeSpaces(text: string): string {
        return StringUtils.replaceAll(text, " ", SPACE_TOKEN);
    }

    export function decodeSpaces(text: string): string {
        return StringUtils.replaceAll(text, SPACE_TOKEN, " ");
    }

    function getDefaultImageDirForOs(): string {
        const thisOs = process.platform;

        switch (thisOs) {
            case "win32": // Also covers Windows 64
                return getDefaultImageDirForWindows();
            case "linux":
            default:
                return process.env.HOME + "/Pictures";
        }
    }

    function getDefaultImageDirForWindows(): string {
        const candidateDirs = [
            `${process.env.USERPROFILE}\\Pictures`,
            `${process.env.USERPROFILE}\\Photos`,
            `${process.env.USERPROFILE}\\Documents`
        ];

        const fallbackDir = candidateDirs[candidateDirs.length - 1];

        return candidateDirs.find(d => existsSync(d)) || fallbackDir;
    }
}
