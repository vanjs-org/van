set -e

VER=$(../node_modules/node-jq/bin/jq -r '.version' ../package.json)

cd ../npm-examples/hello
deno run --allow-read --allow-write ../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S

cd ../../components
npm update vanjs-core -S

for d in $(ls examples); do(
  cd examples/$d
  npm update vanjs-core -S
)done
