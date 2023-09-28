npx tsc
deno run --allow-read --allow-write scripts/to-bundle.ts
npx terser dist/van-ui.nomodule.js --compress --toplevel --mangle --mangle-props regex=/^_.+/ -f wrap_func_args=false -o dist/van-ui.nomodule.min.js
