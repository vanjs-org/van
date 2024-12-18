set -e

npm prune
npm audit fix --force

VER=$(../node_modules/node-jq/bin/jq -r '.version' ../package.json)

cd ../npm-examples/hello
deno run --allow-read --allow-write ../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune
npm audit fix --force

cd ../../demo/terminal
deno run --allow-read --allow-write ../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune
npm audit fix --force

cd ../../components
deno run --allow-read --allow-write ../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune
npm audit fix --force

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
  npm update vanjs-core -S
  npm prune
  npm audit fix --force
)done

cd ../bun-examples/hydration
deno run --allow-read --allow-write ../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune
npm audit fix --force

cd ../../x

deno run --allow-read --allow-write ../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
npm update vanjs-core -S
npm prune
npm audit fix --force

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
  npm update vanjs-core -S
  npm prune
  npm audit fix --force
)done

cd ../graph

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../../components/scripts/upgrade-dep-version.ts package.json vanjs-core $VER
  npm update vanjs-core -S
  npm prune
  npm audit fix --force
)done
