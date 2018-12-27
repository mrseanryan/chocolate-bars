# :chocolate_bar: chocolate-bars readme

Present histograms (bars!) of images in a directory, including extras such as exif data from the camera.

Electron based app which runs on node.js.

## status - !in development!

chocolate-bars is in ongoing development (Linux, Mac, Windows) following semantic versioning.

[![Travis](https://img.shields.io/travis/mrseanryan/chocolate-bars.svg)](https://travis-ci.org/mrseanryan/chocolate-bars)
[![node](https://img.shields.io/node/v/chocolate-bars.svg)](https://nodejs.org)

[![Greenkeeper badge](https://badges.greenkeeper.io/mrseanryan/chocolate-bars.svg)](https://greenkeeper.io/)
[![Dependencies](https://david-dm.org/mrseanryan/chocolate-bars.svg)](https://david-dm.org/mrseanryan/chocolate-bars)
[![Dev Dependencies](https://david-dm.org/mrseanryan/chocolate-bars/dev-status.svg)](https://david-dm.org/mrseanryan/chocolate-bars?type=dev)

[![npm Package](https://img.shields.io/npm/v/chocolate-bars.svg?style=flat-square)](https://www.npmjs.org/package/chocolate-bars)
[![NPM Downloads](https://img.shields.io/npm/dm/chocolate-bars.svg)](https://npmjs.org/package/chocolate-bars)

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/mrseanryan)

## why?

Histograms are useful for finding image defects such as:

-   over-exposure
-   under-exposure
-   low contrast

Also was curious how to implement this in node.js.

## dependencies

-   Node 8.11.3 or higher

## features (in development!)

-   scan a folder of images and present a browsable summary
-   show image thumbnail and histogram
-   show additional image properties such as file size, image size
-   show exif tags where available (JPEG files)

## usage - as cli (command line tool)

### 1 Install dependencies

Install:

-   Yarn
-   Node 8.3.11 (or higher)

### 2 get chocolate bars of images

![Screenshot](./static/site/screenshot-1.png)

#### ways to run

You can run `chocolate-bars` in one of two ways:

-   a) from the source code
-   OR b) as a globally installed command line tool

##### a) from the source code

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
./go.sh <path to image direcory>
```

example:

```
./go.sh ../myPhotos
```

To see more detailed usage info:

```
./go.sh
```

##### b) install globally as a command line tool

`npm i -g electron`

`npm i -g chocolate-bars@latest --production`

To use:

`chocolate-bars <path to image direcory>`

## references

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

### ORIGINAL readme (from the seeder project)

[see here](README.original.md)

## authors

Original work by Sean Ryan - mr.sean.ryan(at gmail.com)

## licence = MIT

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
