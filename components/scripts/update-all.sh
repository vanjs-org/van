set -e

npm run build
npm publish

VER=$(node_modules/node-jq/bin/jq -r '.version' package.json)

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../scripts/upgrade-vanjs-ui-version.ts package.json $VER
  npm update vanjs-ui -S
)done
