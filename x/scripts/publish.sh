set -e

npm publish || true
npm prune
node_modules/node-jq/bin/jq -r -j '.version' package.json > ../../vanjs-org.github.io/code/van-x.version
cp dist/van-x.nomodule.min.js ../../vanjs-org.github.io/code
