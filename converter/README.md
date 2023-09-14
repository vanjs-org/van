# HTML and MD to VanJS Code Converter

This is a library that can convert any MD or HTML snippet into valid **VanJS** code. The UI version of the code converter is [here](https://vanjs.org/convert).

## Installation

The library is published as NPM package [vanjs-converter](https://www.npmjs.com/package/vanjs-converter).

Run the following command to install the package:

```shell
npm install vanjs-converter
```

To use the NPM package, add this line to your script:

```js
import { htmlToVanCode, mdToVanCode } from "vanjs-converter"
```

## `htmlToVanCode`: Convert HTML snippet to VanJS Code

### Signature

```js
htmlToVanCode(<HTML string>, <options>) => {code: <code>, tags: <tags>, components: <components>}
```

### Example

```js
htmlToVanCode('<div><p>👋Hello</p><ul><li>🗺️World</li><li><a href="https://vanjs.org/">🍦VanJS</a></li></ul></div>', {indent: 4})
/*
The following result will be returned:
{
  code: [
    'div(',
    '    p(',
    '        "👋Hello",',
    '    ),',
    '    ul(',
    '        li(',
    '            "🗺️World",',
    '        ),',
    '        li(',
    '            a({href: "https://vanjs.org/"},',
    '                "🍦VanJS",',
    '            ),',
    '        ),',
    '    ),',
    ')',
  ],
  tags: ["a", "div", "li", "p", "ul"],
  components: [],
}
*/
```

### Using VanJS Components

_This is only supported in the converter library, not in the UI._

The input HTML string can be a mix of HTML elements and custom UI components built with **VanJS**. To use custom UI components, just specify the component similar to regular HTML tags. For instance, assume we have custom UI components similar to the ones shown in https://vanjs.org/ home page:

```js
const Hello = text => div(
  p("👋Hello"),
  ul(
    li(text),
    li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
  ),
)

const Counter = ({initValue}) => {
  const counter = van.state(initValue)
  return button({onclick: () => ++counter.val}, counter)
}
```

You can simply specify the input HTML string like this:

```html
<h2>Hello</h2>
<Hello>🗺️World</Hello>
<h2>Counter</h2>
<Counter initValue="1"></Counter>
<Counter initValue="2"></Counter>
```

which will be converted into the following **VanJS** code:

```js
h2(
  "Hello",
),
Hello(
  "🗺️World",
),
h2(
  "Counter",
),
Counter({initValue: "1"}),
Counter({initValue: "2"}),
```

### Options

* `indent`: Type `number`. Default `2`. Optional. The indent level of the generated **VanJS code**.
* `spacing`: Type `boolean`. Default `false`. Optional. The style of the property object in the generated **VanJS** code. If `true`, the property object will look like `{href: "https://vanjs.org/"}`; Otherwise, the property object will look like `{ href: "https://vanjs.org/" }`.
* `skipEmptyText`: Type `boolean`. Default `false`. Optional. Whether to skip empty text nodes in the generated **VanJS code**. For instance, the HTML snippet:

  ```html
  <div>
    <p>👋Hello</p>
    <ul>
      <li>🗺️World</li>
      <li><a href="https://vanjs.org/">🍦VanJS</a></li>
    </ul>
  </div>
  ```

  will be converted to:

  ```js
  div(
    p(
      "👋Hello",
    ),
    ul(
      li(
        "🗺️World",
      ),
      li(
        a({href: "https://vanjs.org/"},
          "🍦VanJS",
        ),
      ),
    ),
  )
  ```

  if `skipEmptyText` is `true`. But it will be converted to:

  ```js
  div(
    "\n  ",
    p(
      "👋Hello",
    ),
    "\n  ",
    ul(
      "\n    ",
      li(
        "🗺️World",
      ),
      "\n    ",
      li(
        a({href: "https://vanjs.org/"},
          "🍦VanJS",
        ),
      ),
      "\n  ",
    ),
    "\n",
  )
  ```

  if `skipEmptyText` is `false`.

* `htmlTagPred`: Type `(name: string) => boolean`. Default `s => s.toLowerCase() === s`. Optional. A predicate function to check whether a specific tag snippet such as `<Counter>` should be treated as a native HTML element or a custom UI component built with **VanJS**. By default, it will be treated as a native HTML element if the letters in the `name` are all lowercase.

### Return Value

A plain object with the following fields:
* `code`: A `string[]` for all lines of the generated **VanJS** code.
* `tags`: A `string[]` for all HTML tag names used in the generated **VanJS** code, which can be used in the importing line of tag functions such as:
  ```js
  const {<tags needs to import>} = van.tags
  ```
* `components`: A `string[]` for all custom **VanJS** components used in the generated **VanJS** code, which can be used in the importing line such as:
  ```js
  import {<components needs to import>} from "./my-component-lib.js"
  ```

### `DUMMY`

_This is only supported in the converter library, not in the UI._

There are 2 special cases while specifying custom **VanJS** components in the input HTML string. The first special case is that, sometimes, a custom component needs properties being specified in its first argument, even for empty properties `{}` (e.g.: the `Counter` component defined in the [section](#using-vanjs-components) above). In this case, you can specify the special `DUMMY` property as a placeholder. For instance:

```html
<CustomElement DUMMY>content</CustomElement>
```

will be converted to:

```js
CustomElement({},
  "content",
)
```

whereas

```html
<CustomElement>content</CustomElement>
```

will be converted to:

```js
CustomElement(
  "content",
)
```

The second special case is that, sometimes, a custom **VanJS** component needs consecutive string arguments. You can achieve that by inserting `<DUMMY>` element between text pieces. For instance:

```html
<Link>🍦VanJS<DUMMY></DUMMY>https://vanjs.org/</Link>
```

will be converted to:

```js
Link(
  "🍦VanJS",
  "https://vanjs.org/",
)
```

## `mdToVanCode`: Convert MD snippet to VanJS Code

### Signature

```js
mdToVanCode(<MD string>, <options>) => {code: <code>, tags: <tags>, components: <components>}
```

Under the hood, there are 2 steps for converting an MD snippet to **VanJS** code:
1. Convert the MD string into an HTML string with [Marked](https://marked.js.org/) library.
2. Convert the HTML string into **VanJS** code with `htmlToVanCode`.

### Example

```js
mdToVanCode(`👋Hello
* 🗺️World
* [🍦VanJS](https://vanjs.org/)
`)
/*
The following result will be returned:
{
  code: [
    'p(',
    '  "👋Hello",',
    '),',
    'ul(',
    '  li(',
    '    "🗺️World",',
    '  ),',
    '  li(',
    '    a({href: "https://vanjs.org/"},',
    '      "🍦VanJS",',
    '    ),',
    '  ),',
    '),',
  ],
  tags: ["a", "li", "p", "ul"],
  components: [],
}
*/
```

Note that, you can insert custom HTML snippets, or even [custom **VanJS** components](#using-vanjs-components) in the input MD string.

### Options

* `indent`: Type `number`. Default `2`. Optional. The indent level of the generated **VanJS code**.
* `spacing`: Type `boolean`. Default `false`. Optional. The style of the property object in the generated **VanJS** code. If `true`, the property object will look like `{href: "https://vanjs.org/"}`; Otherwise, the property object will look like `{ href: "https://vanjs.org/" }`.
* `htmlTagPred`: Type `(name: string) => boolean`. Default `s => s.toLowerCase() === s`. Optional. A predicate function to check whether a specific tag snippet such as `<Counter>` represents a native HTML element or a custom UI component built with **VanJS**. By default, it will be considered a native HTML element if the letters in the `name` are all lowercase.
* `renderer`: Optional. _Custom renderer is only supported in the converter library, not in the UI._ A custom object used to override how tokens in the MD string are being rendered. The specification of the `renderer` object can be found in Marked [doc](https://marked.js.org/using_pro#renderer). For instance, the `renderer` object:

  ```js
  {
    codespan: s => `<Symbol>${s}</Symbol>`,
    link: (href, _unused_title, text) => `<Link>${text}<DUMMY></DUMMY>${href}</Link>`,
  }
  ```

  will convert `` `text` `` in MD string into `Symbol("text")` (here `Symbol` is a custom **VanJS** component) instead of `code("text")`, and will convert `[text](link)` in MD string into `Link("text", "link")` instead of `a({href: "link"}, "text")`.

### Return Value

The same as the [return value](#return-value) of `htmlToVanCode`.

## Showroom

The https://vanjs.org/ website is using this library to keep `README.md` files in sync with their corresponding web pages ([source code](https://github.com/vanjs-org/vanjs-org.github.io/tree/master/codegen) of the code generation):
* The [VanUI](https://vanjs.org/vanui) page is kept in sync with the [`README.md`](https://github.com/vanjs-org/van/tree/main/components#readme) file in GitHub with the help of this library.
* This [`README.md`](https://github.com/vanjs-org/van/tree/main/converter#readme) file is kept in sync with this [page](https://vanjs.org/converter-lib) in https://vanjs.org/ website.
