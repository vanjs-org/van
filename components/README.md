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
Modal({props}, children) => <Created modal window>
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

You can live preview the examples with CodeSandbox (TODO: add link).

#### Property Reference

TODO

### Planned for Future

The following UI components are planned to be added in the future:
* Tabs
* Toggle
* Tooltip
* Banner
* Message
