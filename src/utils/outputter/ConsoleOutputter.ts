import { IOutputter } from "./IOutputter";

export class ConsoleOutputter implements IOutputter {
    error(...items: any[]): void {
        console.error(items);
    }

    info(...items: any[]): void {
        console.log(items);
    }

    warn(...items: any[]): void {
        console.warn(items);
    }
}
