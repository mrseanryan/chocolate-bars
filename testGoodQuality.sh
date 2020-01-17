#!/usr/bin/env bash

# not using cli - so, these args are matching SharedDataUtils.ts
yarn build:minimal && ./go.sh ./static/testData/goodQuality subDirs-disabled verbose
