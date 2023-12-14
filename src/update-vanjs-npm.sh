set -e

npm prune

VER=$(../node_modules/node-jq/bin/jq -r '.version' ../package.json)

cd ../npm-examples/hello
deno run --allow-read --allow-write ../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune

cd ../../demo/terminal
deno run --allow-read --allow-write ../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune

cd ../../components
deno run --allow-read --allow-write ../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
  npm update vanjs-core -S
  npm prune
)done

cd ../bun-examples/hydration
deno run --allow-read --allow-write ../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune

cd ../../x

deno run --allow-read --allow-write ../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
  npm update vanjs-core -S
  npm prune
)done

cd ../addons/van_cone
for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
  npm update vanjs-core -S
  npm prune
)done
