import * as fs from "fs";
import * as path from "path";

import { State } from "../../electronApp/State";
import { FileUtils } from "../../utils/FileUtils";
import { Nodash } from "../../utils/Nodash";
import { IOutputter } from "../../utils/outputter/IOutputter";
import { PagingModel } from "../model/PagingModel";

export namespace ImageFinder {
    export const RECOGNISED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

    export async function findImagesInDirectoryAtPage(
        imageInputDirOrFile: string,
        state: State,
        outputter: IOutputter
    ): Promise<string[]> {
        const files = await findImagesInDirectory(
            imageInputDirOrFile,
            state.enableSubDirs,
            outputter
        );

        return filterFilesForPage(files, state.currentPage);
    }

    function filterFilesForPage(files: string[], currentPage: number): string[] {
        if (currentPage < 0) {
            return files;
        }

        const start = currentPage * PagingModel.IMAGES_PER_PAGE;

        const filesThisPage: string[] = [];
        for (let i = start; i < start + PagingModel.IMAGES_PER_PAGE && i < files.length; i++) {
            filesThisPage.push(files[i]);
        }

        return filesThisPage;
    }

    export async function findImagesInDirectory(
        imageInputDirOrFile: string,
        enableSubDirs: boolean,
        outputter: IOutputter
    ): Promise<string[]> {
        if (
            getFileTypeOrNotEnoughPermissions(imageInputDirOrFile) === FileType.File &&
            isFileExtensionOk(imageInputDirOrFile)
        ) {
            return [imageInputDirOrFile];
        }

        return readImagesAt(imageInputDirOrFile, enableSubDirs, outputter);
    }

    async function readImagesAt(
        imageInputDir: string,
        enableSubDirs: boolean,
        outputter: IOutputter
    ): Promise<string[]> {
        let files: string[];

        try {
            files = await readdirPromise(imageInputDir);
        } catch (error) {
            outputter.error(error);
            return [];
        }

        const absoluteFilePaths = files.map(f => {
            return path.resolve(path.join(imageInputDir, f));
        });

        const imageFilePaths = filterToImages(absoluteFilePaths, outputter);
        imageFilePaths.sort(bySizeAscending);

        if (enableSubDirs) {
            const subDirFilePaths = filterToDirectories(absoluteFilePaths);

            const subDirImageFilePaths = await Promise.all(
                subDirFilePaths.map(subDir => readImagesAt(subDir, enableSubDirs, outputter))
            );

            return imageFilePaths.concat(Nodash.flatten(subDirImageFilePaths));
        }

        return imageFilePaths;
    }

    function readdirPromise(imageInputDir: string) {
        return new Promise<string[]>(function(ok, notOk) {
            fs.readdir(imageInputDir, function(err, _files) {
                if (err) {
                    notOk(err);
                } else {
                    ok(_files);
                }
            });
        });
    }

    function bySizeAscending(one: string, two: string): number {
        const bySize = (filePath: string): number => {
            return FileUtils.isLargeFile(filePath) ? 100000 : 0;
        };

        const byNameAscending = (): number => {
            return path.basename(one).localeCompare(path.basename(two));
        };

        return bySize(one) - bySize(two) + byNameAscending();
    }

    function filterToDirectories(filePaths: string[]): string[] {
        return filePaths.filter(imagePath => {
            return getFileTypeOrNotEnoughPermissions(imagePath) === FileType.Directory;
        });
    }

    function filterToImages(filePaths: string[], outputter: IOutputter): string[] {
        return filePaths.filter(imagePath => {
            if (
                getFileTypeOrNotEnoughPermissions(imagePath) !== FileType.File ||
                !isFileExtensionOk(imagePath)
            ) {
                outputter.warn(
                    `\nskipping file ${imagePath} (is dir or not enough permissions or a skipped file extension)`
                );

                return false;
            }
            return true;
        });
    }

    const isFileExtensionOk = (filepath: string) => {
        if (filepath.endsWith(".dropbox")) {
            return false;
        }

        // extensions - works for files with something before the '.'
        const ext = path.extname(filepath);

        return RECOGNISED_EXTENSIONS.some(goodExt => goodExt.toLowerCase() === ext.toLowerCase());
    };

    enum FileType {
        Directory,
        File,
        Error
    }

    const getFileTypeOrNotEnoughPermissions = (filepath: string): FileType => {
        try {
            const isDirectory = fs.lstatSync(filepath).isDirectory();
            return isDirectory ? FileType.Directory : FileType.File;
        } catch (error) {
            // can occur if not enough permissions, or file is already in use
            console.error(error);
            return FileType.Error;
        }
    };
}
