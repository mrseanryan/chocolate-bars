import * as jquery from "jquery";

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// Run this function after the page has loaded

window.onload = () => {
    jquery(`#content`).text("hello from TS!");
};
