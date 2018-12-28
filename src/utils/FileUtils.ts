import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export namespace FileUtils {
    export function getFilesizeInMegaBytes(filename: string): number {
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        return fileSizeInBytes / (1024 * 1024);
    }

    export function getSmallerFilePath(filePath: string): string {
        return path.join(os.tmpdir(), path.basename(filePath) + ".resized.jpg");
    }

    export function isLargeFile(filePath: string): boolean {
        return getFilesizeInMegaBytes(filePath) > 0.5;
    }

    export function isSmallerFileNewer(filePath: string): boolean {
        const smallerFilePath = getSmallerFilePath(filePath);

        if (!fs.existsSync(smallerFilePath)) {
            return false;
        }

        return getModificationDate(smallerFilePath) > getModificationDate(filePath);
    }

    function getModificationDate(filePath: string): Date {
        return fs.statSync(filePath).mtime;
    }
}
