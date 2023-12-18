# Van Component

## WebComponents with VanJS

Simple function to create a standard Web Component from a VanJS component.

Example

```javascript
import van from "vanjs-core";
import { create } from "./src/van-component";
const { button, div, slot } = van.tags;

create("custom-counter", () => {
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

## Create new elements from VanJS

If you have another VanJS component, you can create web components with this syntax:

```javascript
const someComponent = (emoji) => van.tags["custom-counter"](emoji);
```

The web component will then hydrate properly with the counter, and slot the emoji correctly!

## Why

Hydration in VanJS is not convenient. This small function makes it trivial to have reusable van components. It also pairs very well with VanUI.

## How to use

This is very much WIP. The current way to use this is to copy the code in `dist`.

This small example uses Vite. The minifying part can be done better to produce a smaller bundle, but I leave that work to Tao Xin if he is interested. Don't hesitate to incorporate this inside VanJS's monorepo/toolchain in whichever way suits you best.
