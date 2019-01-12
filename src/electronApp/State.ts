import { ImageDetail } from "../bars/model/ImageDetail";

export type State = {
    currentPage: number;
    imageInputDir: string;
    enableSubDirs: boolean;
    // Each 'browse to directory' or 'select page' is a new epoch,
    // so can igore stale async responses. Alt could be to cancel promises but seems complicated.
    epoch: number;
    selectedImage: ImageDetail | null;
};
