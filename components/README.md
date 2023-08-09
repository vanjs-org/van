# **VanUI**: A Collection of Grab 'n Go Reusable UI Components for VanJS

🙏 Feedback and contribution are welcome and greatly appreciated!

## Installation

Currently, this library only supports NPM. It's published as NPM package [vanjs-ui](https://www.npmjs.com/package/vanjs-ui).

Run the following command to install the package:

```shell
npm install vanjs-ui
```

## Documentation

The following UI components has been implemented so far:
* [Modal](#modal)
* [Tabs](#tabs)

### Modal

Creates a modal window on top of the current page.

#### Signature

```js
Modal({...props}, ...children) => <The created modal window>
```

#### Examples

Example 1:

```ts
const closed = van.state(false)
van.add(document.body, Modal({closed},
  p("Hello, World!"),
  div({style: "display: flex; justify-content: center;"},
    button({onclick: () => closed.val = true}, "Ok"),
  ),
))
```

Example 2:

```ts
const closed = van.state(false)
const formDom = form(
  div(input({type: "radio", name: "lang", value: "Zig", checked: true}), "Zig"),
  div(input({type: "radio", name: "lang", value: "Rust"}), "Rust"),
  div(input({type: "radio", name: "lang", value: "Kotlin"}), "Kotlin"),
  div(input({type: "radio", name: "lang", value: "TypeScript"}), "TypeScript"),
  div(input({type: "radio", name: "lang", value: "JavaScript"}), "JavaScript"),
)

van.add(document.body, Modal({closed, blurBackground: true},
  p("What's your favorite programming language?"),
  formDom,
  p({style: "display: flex; justify-content: center; gap: 3rem;"},
    button({
      onclick: () => {
        const lang = (<HTMLInputElement>formDom.querySelector("input:checked")).value
        alert(lang + " is a good language 😀")
        closed.val = true
      },
    }, "Ok"),
    button({onclick: () => closed.val = true}, "Cancel"),
  )
))
```

You can live preview the examples with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/modal?file=%2Fsrc%2Fmain.ts%3A1%2C1).

#### Property Reference

* `closed`: Type `State<boolean>`. Required. A `State` object used to close the created modal window. Basically, setting `closed.val = true` will close the created modal window.
* `backgroundColor`: Type `string`. Default `"rgba(0,0,0,.5)"`. Optional. The color of the background overlay when the modal is activated.
* `blurBackground`: Type `boolean`. Default `false`. Optional. Whether to blur the background.
* `backgroundClass`: Type `string`. Default `""`. Optional. The `class` attribute of the background overlay. You can specify multiple CSS classes seperated by `" "`.
* `backgroundStyleOverrides`: Type `object`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the background overlay.
* `modalClass`: Type `string`. Default `""`. Optional. The `class` attribute of the created modal element. You can specify multiple CSS classes seperated by `" "`.
* `modalStyleOverrides`: Type `object`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the created modal element.

### Tabs

Creates a tab-view for tabs specified by the user.

#### Signature

```js
Tabs({...props}, tabContents) => <The created tab-view>
```

The `tabContents` parameter is an object whose keys are the titles of the tabs and values (type: `ChildDom | ChildDom[]`) are the DOM element(s) for the tab contents.

#### Example

```ts
van.add(document.body, Tabs({style: "max-width: 500px;"}, {
  Home: p(
    "Welcome to ", b("VanJS"), " - the smallest reactive UI framework in the world.",
  ),
  "Getting Started": [
    p("To install the ", b("VanJS"), " NPM package, run the line below:"),
    pre(code("npm install vanjs-core")),
  ],
  About: p(
    "The author of ", b("VanJS"), " is ",
    a({href: "https://github.com/Tao-VanJS"}, " Tao Xin"), "."
  ),
}))
```

You can live preview the example with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/tabs?file=%2Fsrc%2Fmain.ts%3A1%2C1).

#### Property Reference

* `activeTab`: Type `State<string> | undefined`. Optional. If specified, you can activate a tab via the specified `State` object with `activeTab.val = "<tab title>"`.
* `resultClass`: Type `string`. Default `""`. Optional. The `class` attribute of the result DOM element. You can specify multiple CSS classes seperated by `" "`.
* `style`: Type `string`. Default `""`. Optional. The `style` property of the result DOM element.
* `tabButtonRowColor`: Type `string`. Default `"#f1f1f1"`. Optional. The background color of the container of tab buttons.
* `tabButtonBorderStyle`: Type `string`. Default `1px solid #000`. Optional. The style of borders between tab buttons.
* `tabButtonHoverColor`: Type `string`. Default `#ddd`. Optional. The color when the tab button is hovered.
* `tabButtonActiveColor`: Type `string`. Default `#ccc`. Optional. The color of the tab button for the currently active tab.
* `tabButtonRowClass`: Type `string`. Default `""`. Optional. The `class` attribute of the container of tab buttons. You can specify multiple CSS classes seperated by `" "`.
* `tabButtonRowStyleOverrides`: Type `object`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the container of tab buttons.
* `tabButtonClass`: Type `string`. Default `""`. The `class` attribute of tab buttons. You can specify multiple CSS classes seperated by `" "`.
* `tabButtonStyleOverrides`: Type `object`. Default `{}`. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for tab buttons. You can specify multiple CSS classes seperated by `" "`.
* `tabContentClass`: Type `string`. Default `""`. The `class` attribute of tab contents. You can specify multiple CSS classes seperated by `" "`.
* `tabContentStyleOverrides`: Type `object`. Default `{}`. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for tab contents.

### Planned for Future

The following UI components are planned to be added in the future:
* Toggle
* Tooltip
* Banner
* Message

### Property Bag for Style Overrides

In the API of **VanUI**, you can specify an object as a property bag to override the styles of the created elements. The keys of the property bag are CSS property names, and the values of the property bag are CSS property values. Sample values of the property bag:

```js
{
  "z-index": 1000,
  "background-color": "rgba(0,0,0,.8)",
}
```

```js
{
  "border-radius": "0.2rem",
  padding: "0.8rem",
  "background-color": "yellow",
}
```
