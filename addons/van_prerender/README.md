# VanJS Prerender

_Author: [binhtran432k](https://github.com/binhtran432k)_

Prerender a VanJS tree to a static HTML string without using `van-plate` or
`minivan`.

## Install

```sh
npm install -D vanjs-prerender
```

## Usage

```js
import van from "vanjs-core";
import { prerender } from "vanjs-prerender";

const { a, div, li, p, ul } = van.tags

console.log(
  prerender(() => div(
    p("👋Hello"),
    ul(
      li("🗺️World"),
      li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
    ),
  )),
);
```
