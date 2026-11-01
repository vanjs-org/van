set -e

npm prune
npm audit fix --force

VER=$(node -p "require('./package.json').version")

for d in $(ls examples); do(
  cd examples/$d
  deno run --allow-read --allow-write ../../scripts/upgrade-dep-version.ts package.json vanjs-ext $VER
  npm prune
  npm audit fix --force
)done
