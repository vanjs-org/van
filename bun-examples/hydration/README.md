# A Fullstack Rendering (SSR, CSR and Hydration) Example Based-on Bun

This is a [Bun 1.0](https://bun.sh/blog/bun-v1.0)-based variation of the fullstack rendering exampled illustrated in https://vanjs.org/ssr. Compared to the Node.js based implementation illustrated there, here are notable differences:

* 🚀🚀🚀 Everything becomes extremely fast!
* Much cleaner `package.json`, as the Bun runtime can do most of the work. Here are all the dependencies (the `devDependencies` of `bun` is not necessary if `bun` is installed globally. We include it so that the code can be previewed with CodeSandbox):

```json
  "dependencies": {
    "mini-van-plate": "^0.5.3",
    "vanjs-core": "^1.2.7"
  },
  "devDependencies": {
    "bun": "^1.0.0",
    "bun-types": "^1.0.1"
  }
```

* No script files (`.sh` files) needed.
* The [`src/server.ts`](https://github.com/vanjs-org/van/blob/main/bun-examples/hydration/src/server.ts) file is a few lines shorter than the [Node.js based one](https://github.com/vanjs-org/vanjs-org.github.io/blob/master/hydration-example/src/server.ts), primarily thanks to the elimination of external dependencies.
* The minified bundle of client `.js` file is slightly larger (`3.0kB` vs. `2.6kB`). This is because as a new bundler and minifier, Bun has less size optimization options compared to [terser](https://terser.org/).

You can preview the app via [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/bun-examples/hydration?file=%2Fsrc%2Fserver.ts%3A1%2C1).
