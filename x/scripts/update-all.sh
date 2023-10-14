set -e

npm prune

VER=$(node_modules/node-jq/bin/jq -r '.version' package.json)

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../scripts/upgrade-dep-version.ts package.json vanjs-ext $VER
  npm prune
)done
