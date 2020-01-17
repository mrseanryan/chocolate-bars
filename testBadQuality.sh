#!/usr/bin/env bash

yarn build:minimal && ./go.sh --imageDir=./static/testData/badQuality
