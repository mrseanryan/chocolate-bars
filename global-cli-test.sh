#!/usr/bin/env bash

yarn build:minimal

yarn build:cli

./dist/lib/cli.js static/testData/badQuality/ $1 $2 $3 $4 $5 $6 $7 $8 $9
