import { IOutputter } from "../../utils/outputter/IOutputter";

export type HistogramData = {
    red: []; // Array(256), // Count of the number of times a value appears in the red channel
    green: []; // Array(256), // Count of the number of times a value appears in the green channel
    blue: []; // Array(256), // Count of the number of times a value appears in the blue channel
    alpha: []; // Array(256), // Count of the number of times a value appears in the alpha channel

    colors: {
        rgb: 0; // Number of unique RGB colors
        rgba: 0; // Number of unique RGBA colors
    };

    palettes: {
        rgb: []; // Array of unique colors in hex notation
        rgba: []; // Array of unique colors in hexa notation
    };

    greyscale: true; // Indicates whether all colors are greyscale or not
    alphachannel: false; // Indicates that one or more pixels are translucent
};

declare function histogram(path: string, cb: (err: any, data: HistogramData) => void): void;

export namespace HistogramReader {
    export async function getHistogramData(
        path: string,
        outputter: IOutputter
    ): Promise<HistogramData> {
        return new Promise<HistogramData>((resolve, reject) => {
            histogram(path, (err: any, data: HistogramData) => {
                if (err) {
                    outputter.error(err);
                    reject(err);
                    return;
                }

                outputter.infoVerbose("got histogram for", path);
                resolve(data);
            });
        });
    }
}
