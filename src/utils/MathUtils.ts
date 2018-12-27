export namespace MathUtils {
    export function roundToFewPlaces(value: number): number {
        return Math.round(value * 10) / 10;
    }
}
