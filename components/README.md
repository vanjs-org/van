# **VanUI**: A Collection of Grab 'n Go Reusable UI Components for VanJS

More on **VanJS**:

<div align="center">
  <table>
    <tbody>
      <tr>
        <td>
          <a href="https://github.com/vanjs-org/van/">🏠 Home</a>
        </td>
        <td>
          <a href="https://vanjs.org/start">🖊️ Get Started</a>
        </td>
        <td>
          <a href="https://vanjs.org/tutorial">📖 Tutorial</a>
        </td>
        <td>
          <a href="https://vanjs.org/demo">📚 Examples</a>
        </td>
        <td>
          <a href="https://vanjs.org/convert">📝 HTML to VanJS Converter</a>
        </td>
        <td>
          <a href="https://github.com/vanjs-org/van/discussions">💬 Discuss</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>

🙏 Feedback and contribution are welcome and greatly appreciated!

## Installation

### Via NPM

The library is published as NPM package [vanjs-ui](https://www.npmjs.com/package/vanjs-ui). Run the following command to install the package:

```shell
npm install vanjs-ui
```

To use the NPM package, add this line to your script:

```js
import { <components you want to import> } from "vanjs-ui"
```

### Via a Script Tag

Alternatively, you can import **VanUI** from CDN via a `<script type="text/javascript">` tag:

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/vanjs-ui@0.8.1/dist/van-ui.nomodule.min.js"></script>
```

`https://cdn.jsdelivr.net/npm/vanjs-ui@0.8.1/dist/van-ui.nomodule.js` can be used for the non-minified version.

Note that: **VanJS** needs to be imported via a `<script type="text/javascript">` tag for **VanUI** to work properly.

Try on jsfiddle: [Modal](https://jsfiddle.net/mks9253o/1/), [MessageBoard](https://jsfiddle.net/nwsduza3/).

## Documentation

The following components have been implemented so far:

* Utility components:
  * [Await](#await) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/await?file=%2Fsrc%2Fmain.ts%3A1%2C1))
* UI components:
  * [Modal](#modal) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/modal?file=%2Fsrc%2Fmain.ts%3A1%2C1))
  * [Tabs](#tabs) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/tabs?file=%2Fsrc%2Fmain.ts%3A1%2C1))
  * [MessageBoard](#message) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/message?file=/src/main.ts))
  * [Tooltip](#tooltip) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/tooltip?file=/src/main.ts:1,1))
  * [Toggle](#toggle) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/toggle?file=%2Fsrc%2Fmain.ts%3A1%2C1))
  * [OptionGroup](#optiongroup) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/option-group?file=%2Fsrc%2Fmain.ts%3A1%2C1))
  * [Banner](#banner) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/banner?file=/src/main.ts:1,1))
  * <span style="color:red; padding-right: 0.3rem;">**New!**</span> [FloatingWindow](#floatingwindow) ([preview](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/window?file=%2Fsrc%2Fmain.ts%3A1%2C1))

### Await

`Await` is a utility component that helps you build UI components based on asynchronous data (i.e.: a JavaScript [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) object).

#### Signature

```js
Await(
  {
    value,  // A `Promise` object for asynchronous data
    container,  // The container of the result. Default `div`
    Loading,  // What to render when the data is being loaded
    Error,  // What to render when error occurs
  },
  children,
) => <The created UI element>
```

The `children` parameter (type: `(data: T) => ValidChildDomValue`) is a function that takes the resolved data as input and returns a valid child DOM value (`Node`, primitives, `null` or `undefined`), used to indicate what to render after the data is loaded.

#### Examples

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/await?file=%2Fsrc%2Fmain.ts%3A1%2C1).

Example 1 (fetching the number of GitHub stars):

```ts
const Example1 = () => {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const fetchWithDelay = (url: string, waitMs: number) =>
    sleep(waitMs).then(() => fetch(url)).then(r => r.json())

  const fetchStar = () =>
    fetchWithDelay("https://api.github.com/repos/vanjs-org/van", 1000)
      .then(data => data.stargazers_count)

  const data = van.state(fetchStar())

  return [
    () => h2(
      "Github Star: ",
      Await({
        value: data.val, container: span,
        Loading: () => "🌀 Loading...",
        Error: () => "🙀 Request failed.",
      }, starNumber => `⭐️ ${starNumber}!`)
    ),
    () => Await({
      value: data.val,
      Loading: () => '',
    }, () => button({onclick: () => (data.val = fetchStar())}, "Refetch")),
  ]
}
```

Example 2 (parallel `Await`):

```ts
const Example2 = () => {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const loadNumber = () =>
    sleep(Math.random() * 1000).then(() => Math.floor(Math.random() * 10))

  const a = van.state(loadNumber()), b = van.state(loadNumber())

  return [
    h2("Parallel Await"),
    () => {
      const sum = van.derive(() => Promise.all([a.val, b.val]).then(([a, b]) => a + b))
      return Await({
        value: sum.val,
        Loading: () => div(
          Await({value: a.val, Loading: () => "🌀 Loading a..."}, () => "Done"),
          Await({value: b.val, Loading: () => "🌀 Loading b..."}, () => "Done"),
        ),
      }, sum => "a + b = " + sum)
    },
    p(button({onclick: () => (a.val = loadNumber(), b.val = loadNumber())}, "Reload")),
  ]
}
```

#### Property Reference

* `value`: Type `Promise`. Required. The asynchronous data that the result UI element is based on.
* `container`: Type `TagFunction<Element>`. Default `div` (`van.tags.div`). Optional. The type of the wrapper HTML element for the result.
* `Loading`: Type `() => ValidChildDomValue`. Optional. If specified, indicates what to render when the asynchronous data is being loaded.
* `Error`: Type `(reason: Error) => ValidChildDomValue`. Optional. If specified, indicates what to render when error occurs while fetching the asynchronous data.

### Modal

Creates a modal window on top of the current page.

#### Signature

```js
Modal({...props}, ...children) => <The created modal window>
```

#### Examples

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/modal?file=%2Fsrc%2Fmain.ts%3A1%2C1).

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

const onOk = () => {
  const lang = (<HTMLInputElement>formDom.querySelector("input:checked")).value
  alert(lang + " is a good language 😀")
  closed.val = true
}

van.add(document.body, Modal({closed, blurBackground: true},
  p("What's your favorite programming language?"),
  formDom,
  p({style: "display: flex; justify-content: space-evenly;"},
    button({onclick: onOk}, "Ok"),
    button({onclick: () => closed.val = true}, "Cancel"),
  )
))
```

#### Property Reference

* `closed`: Type `State<boolean>`. Required. A `State` object used to close the created modal window. Basically, setting `closed.val = true` will close the created modal window. You can also subscribe the closing event of the modal window via [`van.derive`](https://vanjs.org/tutorial#api-derive).
* `backgroundColor`: Type `string`. Default `"rgba(0,0,0,.5)"`. Optional. The color of the background overlay when the modal is activated.
* `blurBackground`: Type `boolean`. Default `false`. Optional. Whether to blur the background.
* `backgroundClass`: Type `string`. Default `""`. Optional. The `class` attribute of the background overlay. You can specify multiple CSS classes separated by `" "`.
* `backgroundStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the background overlay.
* `modalClass`: Type `string`. Default `""`. Optional. The `class` attribute of the created modal element. You can specify multiple CSS classes separated by `" "`.
* `modalStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the created modal element.

### Tabs

Creates a tab-view for tabs specified by the user.

#### Signature

```js
Tabs({...props}, tabContents) => <The created tab-view>
```

The `tabContents` parameter is an object whose keys are the titles of the tabs and values (type: `ChildDom`) are the DOM element(s) for the tab contents.

#### Example

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/tabs?file=%2Fsrc%2Fmain.ts%3A1%2C1).

```ts
van.add(document.body, Tabs(
  {
    style: "max-width: 500px;",
    tabButtonActiveColor: "white",
    tabButtonBorderStyle: "none",
    tabButtonRowStyleOverrides: {
      "padding-left": "12px",
    },
  },
  {
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
  },
))
```

#### Property Reference

* `activeTab`: Type `State<string>`. Optional. If specified, you can activate a tab via the specified `State` object with `activeTab.val = "<tab title>"`, and subscribe to the changes of active tab via [`van.derive`](https://vanjs.org/tutorial#api-derive).
* `resultClass`: Type `string`. Default `""`. Optional. The `class` attribute of the result DOM element. You can specify multiple CSS classes separated by `" "`.
* `style`: Type `string`. Default `""`. Optional. The `style` property of the result DOM element.
* `tabButtonRowColor`: Type `string`. Default `"#f1f1f1"`. Optional. The background color of the container of tab buttons.
* `tabButtonBorderStyle`: Type `string`. Default `1px solid #000`. Optional. The style of borders between tab buttons.
* `tabButtonHoverColor`: Type `string`. Default `"#ddd"`. Optional. The color when the tab button is hovered.
* `tabButtonActiveColor`: Type `string`. Default `"#ccc"`. Optional. The color of the tab button for the currently active tab.
* `transitionSec`: Type `number`. Default `0.3`. Optional. The duration of the transition when tab buttons change color.
* `tabButtonRowClass`: Type `string`. Default `""`. Optional. The `class` attribute of the container of tab buttons. You can specify multiple CSS classes separated by `" "`.
* `tabButtonRowStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the container of tab buttons.
* `tabButtonClass`: Type `string`. Default `""`. The `class` attribute of tab buttons. You can specify multiple CSS classes separated by `" "`.
* `tabButtonStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for tab buttons. You can specify multiple CSS classes separated by `" "`.
* `tabContentClass`: Type `string`. Default `""`. The `class` attribute of tab contents. You can specify multiple CSS classes separated by `" "`.
* `tabContentStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for tab contents.

### MessageBoard

Creates a message board to show messages on the screen.

#### Signature

To create a message board:

```js
const board = new MessageBoard({...props})
```

Then you can show messages with `show` method:

```js
board.show({...props}) => <The created DOM node for the message, which is also appended to the message board>
```

Optionally, you can remove the DOM node of the message board with `remove` method:

```js
board.remove()
```

#### Examples

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/message?file=%2Fsrc%2Fmain.ts%3A1%2C1).

```ts
const board = new MessageBoard({top: "20px"})

const example1 = () => board.show({message: "Hi!", durationSec: 1})
const example2 = () => board.show(
  {message: ["Welcome to ", a({href: "https://vanjs.org/", style: "color: #0099FF"}, "🍦VanJS"), "!"], closer: "❌"})

const closed = van.state(false)
const example3 = () => {
  closed.val = false
  board.show({message: "Press ESC to close this message", closed})
}
document.addEventListener("keydown", e => e.key === "Escape" && (closed.val = true))
```

#### Property Reference

Message board properties:

* `top`: Type `string`. Optional. The `top` CSS property of the message board.
* `bottom`: Type `string`. Optional. The `bottom` CSS property of the message board. Exactly one of `top` and `bottom` should be specified.
* `backgroundColor`: Type `string`. Default `"#333D"`. Optional. The background color of the messages shown on the message board.
* `fontColor`: Type `string`. Default `"white"`. Optional. The font color of the messages shown on the message board.
* `fadeOutSec`: Type `number`. Default `0.3`. Optional. The duration of the fade out animation when messages are being closed.
* `boardClass`: Type `string`. Default `""`. Optional. The `class` attribute of the message board. You can specify multiple CSS classes separated by `" "`.
* `boardStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the message board.
* `messageClass`: Type `string`. Default `""`. Optional. The `class` attribute of the message shown on the message board. You can specify multiple CSS classes separated by `" "`.
* `messageStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the message shown on the message board.
* `closerClass`: Type `string`. Default `""`. Optional. The `class` attribute of the message closer. You can specify multiple CSS classes separated by `" "`.
* `closerStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the message closer.

Message properties:

* `message`: Type `ChildDom`. Required. One `ChildDom` or multiple `ChildDom` as an `Array` for the message we want to show.
* `closer`: Type `ChildDom`. Optional. If specified, we will render a closer DOM node with one `ChildDom` or multiple `ChildDom`s as an `Array` which can be clicked to close the shown message.
* `durationSec`: Type `number`. Optional. If specified, the shown message will be automatically closed after `durationSec` seconds.
* `closed`: Type `State<boolean>`. Optional. If specified, the shown message can be closed via the `closed` `State` object with `closed.val = true`. You can also subscribe the closing event of the message via [`van.derive`](https://vanjs.org/tutorial#api-derive).

### Tooltip

Creates a tooltip above a DOM node which typically shows when the DOM node is being hovered.

#### Signature

```js
Tooltip({...props}) => <The created tooltip element>
```

#### Examples

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/tooltip?file=%2Fsrc%2Fmain.ts%3A1%2C1).

```ts
const tooltip1Show = van.state(false)
const tooltip2Show = van.state(false)
const count = van.state(0)
const tooltip2Text = van.derive(() => `Count: ${count.val}`)
const tooltip3Show = van.state(false)

van.add(document.body,
  button({
    style: "position: relative;",
    onmouseenter: () => tooltip1Show.val = true,
    onmouseleave: () => tooltip1Show.val = false,
  }, "Normal Tooltip", Tooltip({text: "Hi!", show: tooltip1Show})), " ",
  button({
    style: "position: relative;",
    onmouseenter: () => tooltip2Show.val = true,
    onmouseleave: () => tooltip2Show.val = false,
    onclick: () => ++count.val
  }, "Increment Counter", Tooltip({text: tooltip2Text, show: tooltip2Show})), " ",
  button({
    style: "position: relative;",
    onmouseenter: () => tooltip3Show.val = true,
    onmouseleave: () => tooltip3Show.val = false,
  }, "Slow Fade-in", Tooltip({text: "Hi from the sloth!", show: tooltip3Show, fadeInSec: 5})),
)
```

Note that the lines:

```ts
{
  style: "position: relative;",
  onmouseenter: () => ...Show.val = true,
  onmouseleave: () => ...Show.val = false,
}
```

are needed for the tooltip element to be shown properly.

#### Property Reference

* `text`: Type `string | State<string>`. Required. The text shown in the tooltip. If a `State` object is specified, you can set the text with `text.val = ...`.
* `show`: Type `State<boolean>`. Required. The `State` object to control whether to show the tooltip or not.
* `width`: Type `string`. Default `"200px"`. Optional. The width of the tooltip.
* `backgroundColor`: Type `string`. Default `"#333D"`. Optional. The background color of the tooltip.
* `fontColor`: Type `string`. Default: `"white"`. Optional. The font color of the tooltip.
* `fadeInSec`: Type `number`. Default `0.3`. Optional. The duration of the fade-in animation.
* `tooltipClass`: Type `string`. Default `""`. Optional. The `class` attribute of the tooltip. You can specify multiple CSS classes separated by `" "`.
* `tooltipStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the tooltip.
* `triangleClass`: Type `string`. Default `""`. Optional. The `class` attribute of the triangle in the bottom. You can specify multiple CSS classes separated by `" "`.
* `triangleStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the triangle in the bottom.

### Toggle

Creates a toggle switch that can be turned on and off.

#### Signature

```js
Toggle({...props}) => <The created toggle switch>
```

#### Example

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/toggle?file=%2Fsrc%2Fmain.ts%3A1%2C1).

```ts
van.add(document.body, Toggle({
  size: 2,
  onColor: "#4CAF50"
}))
```

#### Property Reference

* `on`: Type `boolean | State<boolean>`. Default `false`. Optional. A boolean or a boolean-typed `State` object to indicate the status of the toggle. If a `State` object is specified, you can turn on/off the toggle via the specified `State` object with `on.val = <true|false>`, and subscribe to the status change of the toggle via [`van.derive`](https://vanjs.org/tutorial#api-derive).
* `size`: Type `number`. Default `1`. Optional. The size of the toggle. `1` means the height of the toggle is `1rem`.
* `cursor`: Type `string`. Default `pointer`. Optional. The `cursor` CSS property of the toggle.
* `ofColor`: Type `string`. Default `"#ccc"`. Optional. The color of the toggle when it's off.
* `onColor`: Type `string`. Default `"#2196F3"`. Optional. The color of the toggle when it's on.
* `circleColor`: Type `string`. Default `"white"`. Optional. The color of the toggling circle.
* `toggleClass`: Type `string`. Default `""`. Optional. The `class` attribute of the toggle. You can specify multiple CSS classes separated by `" "`.
* `toggleStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the toggle.
* `sliderClass`: Type `string`. Default `""`. Optional. The `class` attribute of the slider. You can specify multiple CSS classes separated by `" "`.
* `sliderStyleOverrides`. Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the slider.
* `circleClass`. Type `string`. Default `""`. Optional. The `class` attribute of the toggling circle. You can specify multiple CSS classes separated by `" "`.
* `circleStyleOverrides`. Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the toggling circle.
* `circleWhenOnStyleOverrides`. Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the toggling circle. Typically this is used to override the `transform` CSS property if the dimensions of the toggle is overridden.

### OptionGroup

Creates a group of button-shaped options where only one option can be selected. This is functionally similar to a radio group but with a different appearance.

#### Signature

```js
OptionGroup({...props}, options) => <The created option group>
```

The `options` parameter is a `string[]` for all the options.

#### Example

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/option-group?file=%2Fsrc%2Fmain.ts%3A1%2C1).

```ts
const selected = van.state("")
const options = ["Water", "Coffee", "Juice"]

van.add(document.body,
  p("What would you like to drink?"),
  OptionGroup({selected}, options),
  p(() => options.includes(selected.val) ?
    span(b("You selected:"), " ", selected) : b("You haven't selected anything.")),
)
```

#### Property Reference

* `selected`: Type `State<string>`. Required. A `State` object for the currently selected option. You can change the selected option with `selected.val = <option string>`, and subscribe to the selection change via [`van.derive`](https://vanjs.org/tutorial#api-derive).
* `normalColor`: Type `string`. Default `"#e2eef7"`. Optional. The color of the option when it's not selected or hovered.
* `hoverColor`: Type `string`. Default `"#c1d4e9"`. Optional. The color of the option when it's hovered.
* `selectedColor`: Type `string`. Default `"#90b6d9"`. Optional. The color of the option when it's selected.
* `selectedHoverColor`: Type `string`. Default `"#7fa5c8"`. Optional. The color of the option when it's selected and hovered.
* `fontColor`: Type `string`. Default `"black"`. Optional. The font color of the options.
* `transitionSec`: Type `number`. Default `0.3`. Optional. The duration of the transition when the options change color.
* `optionGroupClass`: Type `string`. Default `""`. Optional. The `class` attribute of the entire option group. You can specify multiple CSS classes separated by `" "`.
* `optionGroupStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the entire option group.
* `optionClass`: Type `string`. Default `""`. Optional. The `class` attribute of the options. You can specify multiple CSS classes separated by `" "`.
* `optionStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the options.

### Banner

Creates a banner element for the current container.

#### Signature

```js
Banner({...props}, ...children) => <The created banner element>
```

#### Examples

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/banner?file=%2Fsrc%2Fmain.ts%3A1%2C1).

```ts
van.add(document.body,
  h2("Sticky Banner"),
  div({style: "width: 300px; height: 200px; overflow-y: auto; border: 1px solid #000;"},
    Banner({sticky: true}, "👋Hello 🗺️World"),
    div({style: "padding: 0 10px"}, Array.from({length: 10}).map((_, i) => p("Line ", i))),
  ),
  h2("Non-sticky Banner"),
  div({style: "width: 300px; height: 200px; overflow-y: auto; border: 1px solid #000;"},
    Banner({sticky: false}, "👋Hello ", a({href: "https://vanjs.org/"}, "🍦VanJS")),
    div({style: "padding: 0 10px"}, Array.from({length: 10}).map((_, i) => p("Line ", i))),
  ),
)
```

#### Property Reference

* `backgroundColor`: Type `string`. Default `#fff1a8`. Optional. The background color of the banner.
* `fontColor`: Type `string`. Default `currentcolor`. Optional. The font color of the banner.
* `sticky`: Type `boolean`. Default `false`. Optional. Whether the banner is sticky on the top.
* `bannerClass`: Type `string`. Default `""`. Optional. The `class` attribute of the created banner element. You can specify multiple CSS classes separated by `" "`.
* `bannerStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the created banner element.

### FloatingWindow

_Author: [@Duffscs](https://github.com/Duffscs)_

Creates a movable and resizable floating window.

#### Signature

```js
FloatingWindow({...props}, ...children) => <The created floating window>
```

#### Examples

Preview with [CodeSandbox](https://codesandbox.io/p/sandbox/github/vanjs-org/van/tree/main/components/examples/window?file=%2Fsrc%2Fmain.ts%3A1%2C1).

Window with custom close button:

```ts
const closed = van.state(false)
const width = van.state(300), height = van.state(220)

van.add(document.body, FloatingWindow(
  {title: "Example Window 1", closed, width, height, closeCross: null},
  div({style: "display: flex; flex-direction: column; justify-content: center;"},
    p("Hello, World!"),
    button({onclick: () => width.val *= 2}, "Double Width"),
    button({onclick: () => height.val *= 2}, "Double Height"),
    button({onclick: () => closed.val = true}, "Close Window"),
  ),
))
```

Window with integrated close button:

```ts
van.add(document.body, FloatingWindow(
  {title: "Example Window 2", x: 150, y: 150, headerColor: "lightblue"},
  div({style: "display: flex; justify-content: center;"},
    p("This is another floating window!"),
  ),
))
```

Close button with custom appearance:

```ts
van.add(document.body, FloatingWindow(
  {
    title: "Example Window 3", x: 175, y: 175, closeCross: "❌",
    crossHoverStyleOverrides: {"background-color": "transparent"},
  },
  div({style: "display: flex; justify-content: center;"},
    p("This is a floating window with custom cross button!"),
  ),
))
```

Window with `Tabs`:

```ts
const closed = van.state(false)

van.add(document.body, FloatingWindow(
  {
    closed, x: 200, y: 200, width: 500, height: 300,
    childrenContainerStyleOverrides: { padding: 0 },
  },
  div(
    span({
      class: "vanui-window-cross",
      style: "position: absolute; top: 8px; right: 8px;cursor: pointer;",
      onclick: () => closed.val = true,
    }, "×"),
    Tabs(
      {
        style: "width: 100%;",
        tabButtonActiveColor: "white",
        tabButtonBorderStyle: "none",
        tabButtonRowColor: "lightblue",
        tabButtonRowStyleOverrides: {height: "2.5rem"},
        tabButtonStyleOverrides: {height: "100%"},
      },
      {
        Home: p(
          "Welcome to ", b("VanJS"), " - the smallest reactive UI framework in the world.",
        ),
        "Getting Started": [
          p("To install the ", b("VanJS"), " NPM package, run the line below:"),
          pre(code("npm install vanjs-core")),
        ],
        About: p(
          "The author of ", b("VanJS"), " is ",
          a({href: "https://github.com/Tao-VanJS"}, " Tao Xin"), "."
        ),
      },
    )
  )
))
```

Window without header or integrated close button:

```ts
const closed = van.state(false)

van.add(document.body, FloatingWindow(
  {
    closed, x: 300, y: 300, width: 500, height: 300,
    windowStyleOverrides: {"background-color": "lightgray"},
    childrenContainerStyleOverrides: {
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      height: "100%",
    }
  },
  button({onclick: () => closed.val = true}, "Close Window"),
))
```

Window showing z-index:

```ts
const zIndex = van.state(1)

van.add(document.body, FloatingWindow(
  {title: ["z-index: ", zIndex], x: 200, y: 200, width: 300, height: 100, zIndex},
))
```

Window with custom stacking:

```ts
const zIndex = van.state(1)

van.add(document.body, FloatingWindow(
  {title: "Custom stacking", x: 300, y: 300, customStacking: true, zIndex},
  div({style: "display: flex; justify-content: space-between;"},
    button({onclick: () => zIndex.val++}, "+"),
    p("z-index: ", zIndex),
    button({onclick: () => zIndex.val--}, "-"),
  ),
  div({style: "display: flex; justify-content: center;"},
    button({onclick: () => zIndex.val = topMostZIndex()}, "Bring to Front"),
  ),
))
```

Non-movable window:

```ts
van.add(document.body, FloatingWindow(
  {title: "Not Movable", disableMove: true},
  div({style: "display: flex; justify-content: center;"},
    p("This window is not movable!"),
  ),
))
```

Non-movable window without title:

```ts
const closed = van.state(false)

van.add(document.body, FloatingWindow(
  {closed, x: 150, y: 150, disableMove: true},
  div(
    p("This window is not movable!"),
    p({style: "display: flex; justify-content: center;"},
      button({onclick: () => closed.val = true}, "Close")
    ),
  ),
))
```

Non-resizable window:

```ts
van.add(document.body, FloatingWindow(
  {title: "Not Resizable", x: 200, y: 200, disableResize: true},
  div(
    p({style: "display: flex; justify-content: center;"}, "This window is not resizable!"),
  ),
))
```

#### Default `z-index` Stacking

By default, the `z-index` CSS property of each window comes from the sequence: `1`, `2`, `3`, `...`. Whenever a new window is created or is interacted with (`onmousedown` event is triggered), we assign the `z-index` property of the window to the next number in the sequence. This way, we are making sure that newly created or interacted windows are always brought to the front.

You can override the default stacking behavior by specifying `{customStacking: true}` in `props`. This way, you can manually control the `z-index` of the window via a **VanJS** state.

#### Property Reference

* `title`: Type `ChildDom`. Optional. One `ChildDom` or multiple `ChildDom` as an `Array` for the title of the created window. If not specified, the window won't have a title.
* `closed`: Type `State<boolean>`. Optional. If specified, the created window can be closed via the `closed` `State` object with `closed.val = true`. You can also subscribe the closing event of the created window via [`van.derive`](https://vanjs.org/tutorial#api-derive).
* `x`: Type `number | State<number>`. Default `100`. Optional. The x-coordinate of the created window, in pixels.
* `y`: Type `number | State<number>`. Default `100`. Optional. The y-coordinate of the created window, in pixels.
* `width`: Type `number | State<number>`. Default `300`. Optional. The width of the created window, in pixels.
* `height`: Type `number | State<number>`. Default `200`. Optional. The height of the created window, in pixels.
* `closeCross`: Type `ChildDom`. Default `"×"`. Optional. One `ChildDom` or multiple `ChildDom` as an `Array` for the close button of the created window. If its value is `null`, there won't be a close button. If `title` property is not specified, this property will be ignored and there won't be a close button.
* `customStacking`: type `boolean`. Default `false`. Optional. If `true`, [default `z-index` stacking rule](#default-z-index-stacking) won't be triggered. Users are expected to manually set the `z-index` property of the created window via the `State` object for `z-index` property below.
* `zIndex`: type `number | State<number>`. Optional. If a `State` object is specified, you can use the `State` object to track the change of `z-index` property via [`van.derive`](https://vanjs.org/tutorial#api-derive). If `customTracking` is `true`, you can use this property to manually set the `z-index` property of the created window.
* `disableMove`: type `boolean`. Default `false`. Optional. If `true`, the created window can't be moved.
* `disableResize`: type `boolean`. Default `false`. Optional. If `true`, the created window can't be resized.
* `headerColor`: type `string`. Default `"lightgray"`. Optional. The background color of the window header (title bar).
* `windowClass`: Type `string`. Default `""`. Optional. The `class` attribute of the created window. You can specify multiple CSS classes separated by `" "`.
* `windowStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the created window.
* `headerClass`: Type `string`. Default `""`. Optional. The `class` attribute of the window header (title bar). You can specify multiple CSS classes separated by `" "`.
* `headerStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the window header (title bar).
* `childrenContainerClass`: Type `string`. Default `""`. Optional. The `class` attribute of the container for `children` DOM nodes. You can specify multiple CSS classes separated by `" "`.
* `childrenContainerStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the container of `children` DOM nodes.
* `crossClass`: Type `string`. Default `""`. Optional. The `class` attribute of the close button. You can specify multiple CSS classes separated by `" "`.
* `crossStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the close button.
* `crossHoverClass`: Type `string`. Default `""`. Optional. The `class` attribute of the close button when it's hovered over. You can specify multiple CSS classes separated by `" "`.
* `crossStyleOverrides`: Type `Record<string, string | number>`. Default `{}`. Optional. A [property bag](#property-bag-for-style-overrides) for the styles you want to override for the close button when it's hovered over.

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
