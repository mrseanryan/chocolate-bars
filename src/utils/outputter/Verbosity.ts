export enum Verbosity {
    Low = 1,
    Medium,
    High
}

export function verbosityAsText(verbosity: Verbosity): string {
    switch (verbosity) {
        case Verbosity.Low:
            return "Low";
        case Verbosity.Medium:
            return "Medium";
        case Verbosity.High:
            return "High";
        default:
            return "(unknown)";
    }
}
