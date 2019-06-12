#!/bin/bash -e

cp .env.example .env.local
sed -i -e "s,<PUBLIC_URL>,/clean-planet/globe," .env.local
npm run build
mkdir -p tmp
mv build/* tmp
mkdir -p build/globe
mv tmp/* build/globe
rm -rf tmp

