const remote = require("electron").remote;

export namespace SharedDataUtils {
    export function getArgs(): any[] {
        const args = remote.getGlobal("sharedObject").prop1;
        return args;
    }
}
