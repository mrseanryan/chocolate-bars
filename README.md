# :chocolate_bar: chocolate-bars readme

Present histograms (bars!) of images in a directory, including extra such as exif data from the camera.

Electon based app which runs on node.js.

## status - !in development!

chocolate-bars is in ongoing development (Linux, Mac, Windows) following semantic versioning.

[![Travis](https://img.shields.io/travis/mrseanryan/chocolate-bars.svg)](https://travis-ci.org/mrseanryan/chocolate-bars)
[![Coveralls](https://img.shields.io/coveralls/mrseanryan/chocolate-bars.svg)](https://coveralls.io/github/mrseanryan/chocolate-bars)
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

Histograms are useful for finding iamge defects such as:

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

#### 3 ways to run

You can run `chocolate-bars` in one of three ways:

-   a) as a globally installed command line tool (this is the easiest way)
-   OR b) as an npm package inside an npm project
-   OR c) from the source code

##### a) install globally as a command line tool

`npm i -g chocolate-bars@latest --production`

To use:

`chocolate-bars <path to image>`

##### OR b) from the npm package

Install inside your npm project:

`yarn add chocolate-bars`

via bash script:

`node_modules/chocolate-bars/dist/lib/cli.js <path to image>`

OR via node:

`node node_modules/chocolate-bars/dist/lib/main <path to image>`

##### OR c) from the source code

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

## known issues

### 'sharp' needs to be rebuilt to match node version of electron

```
yarn add electron-rebuild --dev
yarn add sharp
./node_modules/.bin/electron-rebuild
# OR
./node_modules/.bin/electron-rebuild -p -t "dev,prod,optional"
```

-   BUT this messes up sharp -> 'not a valid Windows application'

-   so `yarn add sharp`

ref: https://github.com/onmyway133/blog/issues/69

[fail] use older version of electron, that is on node 8.x (57) - electron 3.x not 4.x ?

-   solution: decided NOT to use sharp in same process as electron

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
