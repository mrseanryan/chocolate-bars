export type State = {
    currentPage: number;
    imageInputDir: string;
    // Each 'browse to directory' or 'select page' is a new epoch,
    // so can igore stale async responses. Alt could be to cancel promises but seems complicated.
    epoch: number;
};
