set -e

npm prune
npm audit fix

VER=$(node -p "require('./package.json').version")

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../scripts/upgrade-dep-version.ts package.json vanjs-ui $VER
  npm prune
  npm audit fix
)done
