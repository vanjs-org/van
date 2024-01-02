# Van Component

_Author: [Atmos4](https://github.com/Atmos4)_

## WebComponents with VanJS

Simple function to create a standard Web Component from a VanJS component.

Example

```javascript
import van from "vanjs-core";
import { createComponent } from "./src/van-component";
const { button, div, slot } = van.tags;

createComponent("custom-counter", () => {
  const counter = van.state(0);
  return div(
    slot(),
    " ",
    counter,
    " ",
    button({ onclick: () => ++counter.val }, "+"),
    button({ onclick: () => --counter.val }, "-")
  );
});
```

and usage in HTML

```html
<custom-counter>❤️</custom-counter>

<custom-counter>👌</custom-counter>
```

You can preview the example via [CodeSandbox](https://codesandbox.io/p/devbox/github/vanjs-org/van/tree/main/addons/van_component?file=%2Findex.html).

## Create custom elements from VanJS

You can create web components from VanJS with this syntax:

```javascript
const someComponent = van.tags["custom-counter"];
```

The web component will then hydrate properly. Its attributes will be transformed into State objects, and are reactive to changes.

```javascript
createComponent("custom-counter", ({ count }) => span(slot(), count), [
  "count", // observed attribute
]);

createComponent("hello-world", () => {
  const count = van.state(0);
  return div(
    van.tags["custom-counter"]({ count }, "Count: "),
    button({ onclick: () => ++count.val }, "+")
  );
});
```

For this to work, you need to supply a third argument to the function with a list of observed attributes.

## Why would I use this

Hydration in VanJS is not convenient. This small function makes it trivial to have reusable van components. It also pairs very well with VanUI.

## How to use

```bash
npm install vanjs-component
```

or copy the file you need from [`dist`](./dist/).

This small example uses Vite. The minifying part can be done better to produce a smaller bundle, but I leave that work to Tao Xin if he is interested. Don't hesitate to incorporate this inside VanJS's monorepo/toolchain in whichever way suits you best.
