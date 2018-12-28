import * as jquery from "jquery";

export namespace JQueryUtils {
    export function clearHtmlDivById(divId: string) {
        jquery(`#${divId}`)
            .children()
            .remove();
    }

    export function clearHtmlDivByClass(cssClass: string) {
        jquery(`.${cssClass}`)
            .children()
            .remove();
    }
}
