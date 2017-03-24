#!/usr/bin/env bash

# Test APIs
npm run build
echo "\n\n\033[0;37m::::::::::\033[0;32mRUNNING TESTS\033[0;37m::::::::::";
NODE_ENV=test mocha dist/test/
npm run clean
mongo test-mongo-test --eval "db.dropDatabase()"