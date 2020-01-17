#!/usr/bin/env bash

yarn build:minimal

yarn build:cli

node ./dist/lib/cli.js --help
