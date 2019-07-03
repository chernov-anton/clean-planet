#!/bin/bash -e

rm -rf deploy
git clone git@github.com:chernov-anton/clean-planet.git deploy
cd deploy

#build of globe with cloud
git checkout simple-globe@1.1
npm i
cp .env.example .env.local
sed -i -e "s,<PUBLIC_URL>,/clean-planet/globe," .env.local
npm run build
mkdir -p build-for-gh/globe
mv build/* build-for-gh/globe

#build of clickable globe with data
git checkout data-planet@1.4
npm i
cp .env.example .env.local
sed -i -e "s,<PUBLIC_URL>,/clean-planet," .env.local
npm run build
mkdir -p build-for-gh
mv build/* build-for-gh

cd ../