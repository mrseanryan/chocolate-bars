const remote = require("electron").remote;

export type ChocolateBarsArgs = {
    imageInputDir: string;
    enableSubDirs: boolean;
    thisScriptDir: string;
    isVerbose: boolean;
};

export namespace SharedDataUtils {
    export function getArgs(): ChocolateBarsArgs {
        const args = remote.getGlobal("sharedObject").prop1;
        return {
            thisScriptDir: args[1],
            imageInputDir: args[2],
            enableSubDirs: args[3] === "subDirs",
            isVerbose: args[4] === "verbose"
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
