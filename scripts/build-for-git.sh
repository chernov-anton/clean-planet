#!/bin/bash -e

rm -rf deploy
git clone git@github.com:chernov-anton/clean-planet.git deploy
cd deploy
git checkout clean-planet@1.0
npm i
cp .env.example .env.local
sed -i -e "s,<PUBLIC_URL>,/clean-planet/globe," .env.local
npm run build
mkdir -p build-for-gh/globe
mv build/* build-for-gh/globe

git checkout data-planet@1.0
npm i
cp .env.example .env.local
sed -i -e "s,<PUBLIC_URL>,/clean-planet/data," .env.local
npm run build
mkdir -p build-for-gh/data
mv build/* build-for-gh/data
rm -rf tmp
cd ../