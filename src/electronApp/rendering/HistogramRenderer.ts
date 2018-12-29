import * as jquery from "jquery";

import { HistogramData, HistogramReader } from "../../bars/files/HistogramReader";
import { ImageDetail } from "../../bars/model/ImageDetail";
import { IOutputter } from "../../utils/outputter/IOutputter";

declare namespace Plotly {
    function newPlot(divId: string, data: any, layout?: any, options?: any): void;
}

export namespace HistogramRenderer {
    export function clear() {
        jquery(`#${getHistogramContainerId()}`)
            .children()
            .remove();
    }

    export function getHistogramContainerId() {
        return "image-histogram";
    }

    // TODO optimise - run histogram as web worker?
    export async function renderHistogramForImage(image: ImageDetail, outputter: IOutputter) {
        // TODO [perf] react + mobx could allow rendering to go ahead w/o histogram
        const histogram = await HistogramReader.getHistogramData(image.smallerFilepath, outputter);

        const range0to255: number[] = [];
        for (let i = 0; i < 256; i++) {
            range0to255.push(i);
        }

        const greys = calculateGreysFromHistogram(histogram);

        const trace = {
            x: range0to255,
            y: greys,
            // ref: https://plot.ly/javascript/histograms/#colored-and-styled-histograms
            marker: {
                // ref: https://www.rapidtables.com/web/color/brown-color.html
                color: "rgb(139,69,19)",
                line: {
                    color: "rgb(210,105,30)",
                    width: 1
                }
            },
            opacity: 0.75,
            type: "bar"
        };
        const data = [trace];

        const layout = {
            bargap: 0.1,
            bargroupgap: 0.1,
            barmode: "overlay",
            margin: {
                l: 25,
                r: 25,
                b: 25,
                t: 25,
                pad: 4
            },
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#c7c7c7",
            xaxis: {
                fixedrange: true
            },
            yaxis: {
                fixedrange: true
            }
        };

        Plotly.newPlot(getHistogramContainerId(), data, layout, { responsive: true });
    }

    // Calculate greys as average of R, G, B
    function calculateGreysFromHistogram(histogram: HistogramData): number[] {
        if (histogram.greyscale) {
            return histogram.red;
        }

        const greys: number[] = [];
        for (let r = 0; r < histogram.red.length; r++) {
            const total = histogram.red[r] + histogram.green[r] + histogram.blue[r];

            const average = total / 3;

            greys.push(average);
        }

        return greys;
    }
}
