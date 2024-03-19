set -e

npm publish || true
npm prune
VER=$(node_modules/node-jq/bin/jq -r '.version | split("-")[0]' package.json)
echo -n $VER > ../../vanjs-org.github.io/code/van-x.version
cp dist/van-x.nomodule.js ../../vanjs-org.github.io/code
cp dist/van-x.nomodule.min.js ../../vanjs-org.github.io/code
cp src/van-x.d.ts ../../vanjs-org.github.io/code/van-x-$VER.d.ts
