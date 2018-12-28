import * as jquery from "jquery";

export namespace JQueryUtils {
    export function clearHtmlDiv(divId: string) {
        jquery(`#${divId}`)
            .children()
            .remove();
    }
}
