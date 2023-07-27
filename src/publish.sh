set -e

VER=$(jq -r ".version" ../package.json)
echo -n $VER > ../public/van.version
TERSER=../node_modules/terser/bin/terser

cp van.d.ts van.debug.d.ts

cp van.js ../public/van-$VER.js
cp van.d.ts ../public/van-$VER.d.ts
cp van.debug.js ../public/van-$VER.debug.js
cp van.d.ts ../public/van-$VER.debug.d.ts
../node_modules/esbuild/bin/esbuild van.forbundle.js --bundle --outfile=../public/van-$VER.nomodule.js
../node_modules/esbuild/bin/esbuild van.forbundle.debug.js --bundle --outfile=../public/van-$VER.nomodule.debug.js

$TERSER van.js --compress --toplevel --mangle --mangle-props regex=/^_.+/ -f wrap_func_args=false -o ../public/van-$VER.min.js
gzip -kf ../public/van-$VER.min.js
cp van.d.ts ../public/van-$VER.min.d.ts
MIN_NOMODULE=$($TERSER ../public/van-$VER.nomodule.js --compress --toplevel --mangle --mangle-props regex=/^_.+/ -f wrap_func_args=false)
echo -n "{let${MIN_NOMODULE:3}}" > ../public/van-$VER.nomodule.min.js

cp ../public/van-$VER.js ../public/van-latest.js
cp ../public/van-$VER.d.ts ../public/van-latest.d.ts
cp ../public/van-$VER.min.js ../public/van-latest.min.js
cp ../public/van-$VER.min.js.gz ../public/van-latest.min.js.gz
cp ../public/van-$VER.min.d.ts ../public/van-latest.min.d.ts
cp ../public/van-$VER.debug.js ../public/van-latest.debug.js
cp ../public/van-$VER.debug.d.ts ../public/van-latest.debug.d.ts
cp ../public/van-$VER.nomodule.js ../public/van-latest.nomodule.js
cp ../public/van-$VER.nomodule.min.js ../public/van-latest.nomodule.min.js
cp ../public/van-$VER.nomodule.debug.js ../public/van-latest.nomodule.debug.js

sed -i .bak s/van\\.js/van-$VER\\.js/ ../public/van-$VER.debug.js
sed -i .bak s/van\\.js/van-latest\\.js/ ../public/van-latest.debug.js

rm ../public/*.bak

# Testing
../node_modules/typescript/bin/tsc -m es2020 -t es2017 ../test/van.test.ts
../node_modules/esbuild/bin/esbuild ../test/van.test.forbundle.js --bundle --banner:js="'use strict';" --outfile=../test/van.test.nomodule.js
