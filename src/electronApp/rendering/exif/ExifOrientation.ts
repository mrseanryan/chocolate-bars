// ref: https://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
// note: rotating *clockwise*
export enum ExifOrientation {
    Normal = 0,
    Rotated90 = 8,
    Rotated180 = 3,
    Rotated270 = 6,
    ReflectedVerticalAxis = 2,
    Rotated90AndReflectedHorizontalAxis = 7,
    Rotated180AndReflectedVerticalAxis = 4,
    Rotated270AndReflectedHorizontalAxis = 5
}
