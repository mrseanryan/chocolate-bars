#!/usr/bin/env bash

set -e

yarn build:minimal

yarn build:cli

# --imageDir=static/testData/badQuality/
node ./dist/lib/cli.js $1 $2 $3 $4 $5 $6 $7 $8 $9
