import { existsSync } from "fs";

const yargs = require("yargs");

export type Args = {
    imageDir: string;
    subDirs: boolean;
    shrink: boolean;
    isVerbose: boolean;
};

export namespace ArgsParser {
    export function parse(): Args {
        const argv = yargs.options({
            imageDir: {
                type: "string",
                default: getDefaultImageDirForOs(),
                description:
                    "The folder containing images. Defaults to typical locations for your OS."
            },
            shrink: {
                type: "boolean",
                default: false,
                description:
                    "Shrink images the given imageDir. Internal option that you do not normally need to use."
            },
            subdirs: {
                type: "boolean",
                default: false,
                description: "If true, then also show images from sub-folders."
            },
            verbose: {
                type: "boolean",
                default: false,
                description: "If true, then use verbose logging."
            }
        }).argv;

        const imageDir = argv.imageDir || getDefaultImageDirForOs();

        return {
            imageDir,
            isVerbose: !!argv.verbose,
            shrink: !!argv.shrink,
            subDirs: !!argv.subDirs
        };
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
