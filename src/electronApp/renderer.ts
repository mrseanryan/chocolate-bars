import { DataStorage } from "../bars/model/persisted/DataStorage";
import { SharedDataUtils } from "../utils/SharedDataUtils";
import { AppRenderer } from "./AppRenderer";

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.onload = () => {
    AppRenderer.onLoad();

    const imageInputDir = SharedDataUtils.getArgs()[2];

    processDirectory(imageInputDir);
};

function processDirectory(imageInputDir: string) {
    setTimeout(() => {
        AppRenderer.renderContainerAndDetailWithImages(imageInputDir);
    }, 0);
}
