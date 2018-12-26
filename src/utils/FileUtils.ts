import * as fs from "fs";

export namespace FileUtils {
    export function getFilesizeInMegaBytes(filename: string): number {
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        return fileSizeInBytes / (1024 * 1024);
    }

    export function isLargeFile(filePath: string): boolean {
        return getFilesizeInMegaBytes(filePath) > 0.5;
    }
}
