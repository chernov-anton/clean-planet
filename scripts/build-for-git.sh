#!/bin/bash -e

rm -rf tmp
git checkout clean-planet@1.0
npm i
cp .env.example .env.local
sed -i -e "s,<PUBLIC_URL>,/clean-planet/globe," .env.local
npm run build
mkdir -p tmp
mv build/* tmp
mkdir -p deploy/globe
mv tmp/* deploy/globe
rm -rf tmp

git checkout data-planet@1.0
npm i
cp .env.example .env.local
sed -i -e "s,<PUBLIC_URL>,/clean-planet/data," .env.local
npm run build
mkdir -p tmp
mv build/* tmp
mkdir -p deploy/data
mv tmp/* deploy/data
rm -rf tmp