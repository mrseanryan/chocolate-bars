#!/usr/bin/env bash

yarn build:minimal && ./go.sh --imageDir=./node_modules/exif-orientation-examples-sr
