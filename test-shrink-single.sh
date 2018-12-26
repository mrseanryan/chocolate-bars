#!/usr/bin/env bash

yarn build:minimal && node ./dist/lib/main.js ./static/testData/goodQuality/flower-631765_960_720.jpg --shrink $1 $2 $3 $4 $5 $6 $7 $8 $9
