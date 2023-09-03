set -e

npm run build
npm publish
npm prune
