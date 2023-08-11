set -e

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../scripts/upgrade-vanjs-ui-version.ts package.json $1
  npm update vanjs-ui --S
)done
