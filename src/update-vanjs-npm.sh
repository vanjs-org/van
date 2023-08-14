set -e

cd ../npm-examples/hello
npm update vanjs-core -S

cd ../../components
npm update vanjs-core -S

for d in $(ls examples); do(
  cd examples/$d
  npm update vanjs-core -S
)done
