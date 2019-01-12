import { SharedDataUtils } from "../utils/SharedDataUtils";
import { AppRenderer } from "./AppRenderer";

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.onload = () => {
    AppRenderer.onLoad();

    processDirectory();
};

function processDirectory() {
    setTimeout(() => {
        const args = SharedDataUtils.getArgs();

        AppRenderer.renderContainerAndDetailWithImages(args);
    }, 0);
}
