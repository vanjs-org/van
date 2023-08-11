set -e

mkdir examples/$1

cp examples/modal/package.json examples/$1
cp -r examples/modal/src examples/$1
cp examples/modal/vite.config.ts examples/$1
cp examples/modal/index.html examples/$1
cp examples/modal/public examples/$1
cp examples/modal/tsconfig.json examples/$1
