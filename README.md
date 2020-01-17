# :chocolate_bar: chocolate-bars readme

Present histograms (bars!) of images in a directory, including extras such as exif data from the camera. Star and move favorite images.

Electron based app - so, it runs on node.js.

## status - stable

chocolate-bars is stable on Windows, Linux Ubuntu (Mac is possible but not tested). Releases follow semantic versioning.

[![Travis](https://img.shields.io/travis/mrseanryan/chocolate-bars.svg)](https://travis-ci.org/mrseanryan/chocolate-bars)
[![node](https://img.shields.io/node/v/chocolate-bars.svg)](https://nodejs.org)

[![Dependencies](https://david-dm.org/mrseanryan/chocolate-bars.svg)](https://david-dm.org/mrseanryan/chocolate-bars)
[![Dev Dependencies](https://david-dm.org/mrseanryan/chocolate-bars/dev-status.svg)](https://david-dm.org/mrseanryan/chocolate-bars?type=dev)

[![npm Package](https://img.shields.io/npm/v/chocolate-bars.svg?style=flat-square)](https://www.npmjs.org/package/chocolate-bars)
[![NPM Downloads](https://img.shields.io/npm/dm/chocolate-bars.svg)](https://npmjs.org/package/chocolate-bars)

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## why?

Histograms are useful for finding image defects such as:

-   over-exposure
-   under-exposure
-   low contrast

Also was curious how to implement this in node.js.
And - I really miss the 'moved starred images' feature of [good ole' Picasa](http://googlephotos.blogspot.com/2016/02/moving-on-from-picasa.html)

## dependencies

-   Node 10.18.0 or higher

### dependencies for Windows

We use `sharp` to resize images during processing. `sharp` requires
**[node-gyp](https://github.com/nodejs/node-gyp)** to build, so you will need to
install
[Microsoft's windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)
using this command:

```bash
npm install --global --production windows-build-tools
```

## features

-   scan a folder of images and present a browsable summary
-   show image thumbnails and histogram
-   show additional image properties such as file size, image size
-   show exif tags where available (JPEG files)
-   'star' images in a folder like in Picasa
-   move previously 'starred' images to a new folder
-   delete the selected image
-   handles large number of images (2000+) and sub-directories, via paging
-   supports JPEG, PNG file formats
-   correctly handles JPEG image orientation (from EXIF)

## usage - as cli (command line tool)

### View Images and Get chocolate bars (histograms)

![Screenshot](./static/site/screenshot-6.png)

#### ways to run

You can run `chocolate-bars` in one of two ways:

-   a) as a globally installed command line tool
-   OR b) from the source code

##### a) install globally as a command line tool

`npm i -g electron@4`

`npm i -g chocolate-bars@latest --production`

note: on Ubuntu you may need to prefix the above commands with `sudo`:

`sudo npm i -g electron@4`

`sudo npm i -g chocolate-bars@latest --production`

To use:

`chocolate-bars [--imageDir=<path to image directory>] [--subDirs]`

where `--subDirs` means also view images in sub directories.

If `imageDir` is not given, then `chocolate-bars` will try to open the default photos folder, depending on the OS.

##### b) from the source code

```
yarn
```

_On Windows: use a bash shell like `git bash`._

To test your installation:

```
./test.sh
```

To check your images:

```
./go.sh --imageDir=<path to image direcory>
```

example:

```
./go.sh --imageDir=../myPhotos --subDirs
```

where `--subDirs` means also view images in sub directories.

### keyboard shortcuts

A number of keyboard shortcuts are available:

| Area                             | Key                  | Action                                 |
| -------------------------------- | -------------------- | -------------------------------------- |
| Images panel                     | Up Arrow, Down Arrow | Scroll up or down the set of images.   |
| Images panel                     | Space                | Scroll down the set of images.         |
| Selected image, Expanded image\* | +                    | Toggle the expanded view of the image. |
| Selected image, Expanded image\* | \* or Enter          | Toggle the star for that image.        |
| Expanded image\*                 | Left Arrow           | Show the previous image.               |
| Expanded image\*                 | Right Arrow          | Show the next image.                   |
| Expanded image\*                 | Delete               | Prompt to delete the expanded image.   |
| Expanded image\*                 | Escape               | Close the expanded image.              |

\* _An image is expanded by clicking on the small orange box in the top-right of the image._

## references

### image data

#### color spaces in image files

http://regex.info/blog/photo-tech/color-spaces-page2

#### online exif viewer

http://exif.regex.info/exif.cgi

### electron starter

https://github.com/electron/electron-quick-start

### electron and react boilerplate

https://github.com/iRath96/electron-react-typescript-boilerplate

https://github.com/electron-react-boilerplate/electron-react-boilerplate

## sites

| site                 | URL                                          |
| -------------------- | -------------------------------------------- |
| source code (github) | https://github.com/mrseanryan/chocolate-bars |
| github page          | https://mrseanryan.github.io/chocolate-bars/ |
| npm                  | https://www.npmjs.com/package/chocolate-bars |

## developing code in _this_ repository

see the [contributing readme](CONTRIBUTING.md).

## origin

This project is based on the excellent seeder project [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter).

### libaries

**chocolate-bars** uses the [ExifReader library](https://github.com/mattiasw/ExifReader).

### ORIGINAL readme (from the seeder project)

[see here](README.original.md)

## authors

Original work by Sean Ryan - mr.sean.ryan(at gmail.com)

## licence = MIT

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
