set -e

mkdir examples/$1

cp examples/modal/package.json examples/$1
cp -r examples/modal/src examples/$1
cp examples/modal/vite.config.ts examples/$1
cp examples/modal/index.html examples/$1
cp -r examples/modal/public examples/$1
cp examples/modal/tsconfig.json examples/$1

CAP_NAME=$(echo $1 | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2));}')

deno run --allow-read --allow-write scripts/replace-string.ts examples/$1/package.json "vanjs-ui-example-modal" "vanjs-ui-example-$1"
deno run --allow-read --allow-write scripts/replace-string.ts examples/$1/index.html "Modal Demo" "$CAP_NAME Demo"
