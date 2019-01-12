const remote = require("electron").remote;

export type ChocolateBarsArgs = {
    imageInputDir: string;
    enableSubDirs: boolean;
    thisScriptDir: string;
};

export namespace SharedDataUtils {
    export function getArgs(): ChocolateBarsArgs {
        const args = remote.getGlobal("sharedObject").prop1;
        return {
            imageInputDir: args[2],
            enableSubDirs: getEnableSubDirs(args[3]),
            thisScriptDir: args[1]
        };
    }

    // Can be launched via cli (yargs) OR directly via node
    function getEnableSubDirs(value: string | boolean): boolean {
        if (value === "true") {
            return true;
        }

        if (value === "--subDirs") {
            return true;
        }

        return false;
    }
}
