#!/usr/bin/env bash

set -e

yarn build:minimal

yarn build:cli

node ./dist/lib/cli.js --imageDir="static/testData/dir with spaces" --verbose
