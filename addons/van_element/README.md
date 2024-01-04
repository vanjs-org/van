# Van Element

_Author: [Atmos4](https://github.com/Atmos4)_

## WebComponents with VanJS

Create VanJS web components with ease. [See it in action on CodePen!](https://codepen.io/atmos4/pen/ZEPEvvB).

## Main repository

See the source code, contribute and raise issues:  
https://github.com/Atmos4/van-element

## Documentation

https://van-element.pages.dev/.

## Usage

```javascript
import van from "vanjs-core";
import { define } from "vanjs-element";

const { button, div, slot } = van.tags;

define("custom-counter", () => {
  const counter = van.state(0);
  return div(
    slot(),
    counter,
    button({ onclick: () => ++counter.val }, "+"),
    button({ onclick: () => --counter.val }, "-")
  );
});
```

In your HTML:

```html
<custom-counter>❤️</custom-counter>

<custom-counter>👌</custom-counter>
```

## Why use this

- automatic hydration of VanJS inside your HTML
- reusable components without extra boilerplate
- isolated styles and slots with Web components
- only 40 lines of code (300b min+gzip)
