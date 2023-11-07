set -e

mkdir examples/$1

cp examples/list-basic/package.json examples/$1
cp -r examples/list-basic/src examples/$1
cp examples/list-basic/vite.config.ts examples/$1
cp examples/list-basic/index.html examples/$1
cp -r examples/list-basic/public examples/$1
cp examples/list-basic/tsconfig.json examples/$1/tsconfig.json

deno run --allow-read --allow-write scripts/replace-string.ts examples/$1/package.json "van-x-example-list-basic" "van-x-example-$1"
