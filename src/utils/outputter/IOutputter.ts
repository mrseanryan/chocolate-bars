export interface IOutputter {
    error(...items: any[]): void;
    info(...items: any[]): void;
    warn(...items: any[]): void;
}
