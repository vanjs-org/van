set -e

npm publish || true
npm prune
VER=$(node -p "require('./package.json').version.split('-')[0]")
echo -n $VER > ../../vanjs-org.github.io/code/van-x.version
cp dist/van-x.nomodule.js ../../vanjs-org.github.io/code/van-x-$VER.nomodule.js
cp dist/van-x.nomodule.min.js ../../vanjs-org.github.io/code/van-x-$VER.nomodule.min.js
cp src/van-x.d.ts ../../vanjs-org.github.io/code/van-x-$VER.d.ts
