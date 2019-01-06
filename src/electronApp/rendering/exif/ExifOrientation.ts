// ref: https://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
// note: rotating *clockwise*
export enum ExifOrientation {
    Normal = 1,
    Rotated90 = 8,
    Rotated180 = 3,
    Rotated270 = 6,
    ReflectedVerticalAxis = 2,
    Rotated90AndReflectedHorizontalAxis = 7,
    Rotated180AndReflectedVerticalAxis = 4,
    Rotated270AndReflectedHorizontalAxis = 5
}

export function parseOrientationOrThrow(orientationText: string): ExifOrientation {
    if (orientationText.length === 0) {
        throw new Error(`orientationText is empty`);
    }

    const index = parseInt(orientationText, 10);

    const orientation = index as ExifOrientation;

    if (orientation === undefined) {
        throw new Error(`Cannot parse ExifOrientation '${orientationText}'`);
    }

    if (orientation < 1 || orientation > 8) {
        throw new Error(`ExifOrientation '${orientationText}' is out of range (1..8)`);
    }

    return orientation;
}
