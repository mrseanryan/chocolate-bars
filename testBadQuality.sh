#!/usr/bin/env bash

yarn build:minimal && ./go.sh ./static/testData/badQuality
