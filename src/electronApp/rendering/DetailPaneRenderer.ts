import * as jquery from "jquery";

import { HistogramData, HistogramReader } from "../../bars/files/HistogramReader";
import { ImageDetail } from "../../bars/model/ImageDetail";
import { MathUtils } from "../../utils/MathUtils";
import { IOutputter } from "../../utils/outputter/IOutputter";

export namespace DetailPaneRenderer {
    export function renderDetailForImage(image: ImageDetail, outputter: IOutputter) {
        clear();

        renderHistogramForImage(image, outputter)
            .then(() => {
                renderImageText(image, outputter);
            })
            .catch(error => outputter.error(error));
    }

    function clear() {
        jquery("#image-text")
            .children()
            .remove();

        jquery("#image-histogram")
            .children()
            .remove();
    }

    function renderImageText(image: ImageDetail, outputter: IOutputter) {
        const html =
            `<div>dimensions: ${image.dimensions.width} x ${image.dimensions.height}</div>` +
            `<div>file size: ${MathUtils.roundToFewPlaces(image.fileSizeInMb)} Mb</div>`;

        jquery("#image-text").append(html);
    }

    declare namespace Plotly {
        function newPlot(divId: string, data: any, layout?: any): void;
    }

    // TODO xxx extract to HistogramRenderer
    // TODO optimise - run histogram as web worker?
    async function renderHistogramForImage(image: ImageDetail, outputter: IOutputter) {
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
            autosize: false,
            bargap: 0.1,
            bargroupgap: 0.1,
            barmode: "overlay",
            width: 750,
            height: 250,
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

        Plotly.newPlot("image-histogram", data, layout);
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
