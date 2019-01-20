// Interesting subset of exif tags
export enum ExifTag {
    ApertureValue = "ApertureValue", // 1.53
    ColorSpace = "ColorSpace", // sRGB, 1 = sRGB
    DateTime = "DateTime", // 2018:07:15 16:57:48
    DigitalZoomRatio = "DigitalZoomRatio", // 1/1
    ExposureTime = "ExposureTime", // 0.007518796992481203, 1/1600
    FNumber = "FNumber", // 1.7, 4/1
    Flash = "Flash", // 0(Flash did not fire)
    // [object Object](Fired: False; Return: 0; Mode: 0; Function: False; RedEyeMode: False)
    FocalLength = "FocalLength", // 4.2
    FocalLengthIn35mmFormat = "FocalLengthIn35mmFormat",
    GPSAltitude = "GPSAltitude", // 51 m
    GPSAltitudeRef = "GPSAltitudeRef", // Sea level
    GPSDateStamp = "GPSDateStamp", // 2018:07:15
    GPSLatitude = "GPSLatitude", // 51.92166666666667
    GPSLatitudeRef = "GPSLatitudeRef", // North latitude
    GPSLongitude = "GPSLongitude", // 4.502777777777778
    GPSLongitudeRef = "GPSLongitudeRef", // East longitude
    ISOSpeedRatings = "ISOSpeedRatings", // 40
    Orientation = "Orientation", // right-top
    ResolutionUnit = "ResolutionUnit", // 2, inches,
    ShutterSpeedValue = "ShutterSpeedValue", // 7.05
    SubjectDistance = "SubjectDistance", // 3/100
    XResolution = "XResolution", // 72
    YResolution = "YResolution" // 72
}
