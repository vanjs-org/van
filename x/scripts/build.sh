npx tsc -m esnext -t esnext --moduleResolution bundler test/van-x.test.ts
deno run --allow-read --allow-write scripts/to-bundle.ts
npx terser dist/van-x.nomodule.js --compress --toplevel --mangle --mangle-props regex=/^_.+/ -f wrap_func_args=false -o dist/van-x.nomodule.min.js
