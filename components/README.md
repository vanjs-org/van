# **VanUI**: A Collection of Grab 'n Go Reusable UI Components for VanJS

## Installation

Currently, this library only supports NPM. It's published as NPM package [vanjs-ui](https://www.npmjs.com/package/vanjs-ui).

Run the following command to install the package:

```shell
npm install vanjs-ui
```

## Documentation

The following UI components has been implemented so far:

### Modal

Creates a modal window on top of the current page.

#### Signature

```js
Modal({...props}, ...children) => <Created modal window>
```

#### Examples

Example 1:

```js
const closed = van.state(false)
van.add(document.body, Modal({closed},
  p("Hello, World!"),
  div({style: "display: flex; justify-content: center;"},
    button({onclick: () => closed.val = true}, "Ok"),
  ),
))
```

Example 2:

```js
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
* `backgroundClass`: Type `string`. Default `""`. Optional. The `class` property of the background overlay.
* `backgroundStyleOverrides`: Type `object`. Default `{}`. Optional. A property bag for the styles you want to override for the background overlay. Sample value `{"z-index": 1000, "background-color": "rgba(0,0,0,.8)"}`.
* `modalClass`: Type `string`. Default `""`. Optional. The `class` property of the created modal element.
* `modalStyleOverrides`: Type `object`. Default `{}`. Optional. A property bag for the styles you want to override for the created modal element. Sample value `{"border-radius": "0.2rem", padding: "0.8rem", "background-color": "yellow"}`

### Planned for Future

The following UI components are planned to be added in the future:
* Tabs
* Toggle
* Tooltip
* Banner
* Message
