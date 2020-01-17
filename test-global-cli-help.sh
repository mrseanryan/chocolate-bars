#!/usr/bin/env bash

set -e

yarn build:minimal

yarn build:cli

node ./dist/lib/cli.js --help
