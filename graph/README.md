# **VanGraph**: Visualize Dependencies in Your App

**VanGraph** is a library that helps you visualize dependency graph among states and DOM nodes with the help of [Graphviz](https://graphviz.org/). Here is the sample usage:

```js
const firstName = van.state("Tao"), lastName = van.state("Xin")
const fullName = van.derive(() => `${firstName.val} ${lastName.val}`)

// Build the DOM tree...

// To visualize the dependency graph among `firstName`, `lastName`, `fullName`, and all the
// derived states and DOM nodes from them.
vanGraph.show({firstName, lastName, fullName})
```

Checkout a demo in [CodeSandbox](https://codesandbox.io/p/devbox/github/vanjs-org/van/tree/main/graph/examples/basic?file=%2Fsrc%2Fmain.ts).

## Installation

### Via NPM

The library is published as NPM package [vanjs-graph](https://www.npmjs.com/package/vanjs-graph). Run the following command to install the package:

```shell
npm install vanjs-graph
```

To use the NPM package, add this line to your script:

```js
import * as vanGraph from "vanjs-graph"
```

### Via a Script Tag

Alternatively, you can import **VanGraph** from CDN via a `<script type="text/javascript">` tag:

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/vanjs-graph@0.1.0/dist/van-graph.nomodule.min.js"></script>
```

`https://cdn.jsdelivr.net/npm/vanjs-graph@0.1.0/dist/van-graph.nomodule.js` can be used for the non-minified version.

Note that: you need to import **VanJS** and `@viz-js/viz` before **VanGraph** for it to be used properly:

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.nomodule.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@viz-js/viz@3.8.0/lib/viz-standalone.js"></script>
```

[Try on jsfiddle](https://jsfiddle.net/zo49cqys/1/)

## Documentation

```js
vanGraph.show(states[, options]) => Promise<SVGSVGElement>
```

The parameter `states` represents a collection of `State` objects whose dependency graph we want to visualize. All the `State` objects and their dependents will be rendered in the dependency graph. `states` can either be specified as a plain object, e.g.: `{firstName, lastName, fullName}`, or as an array, e.g.: `[firstName, lastName, fullName]`. If `states` is specified as an array, the variable names won't be shown in the rendered graph.

`options` is a plain object with the following properties:
* `rankdir`: Type `string`. Default `"LR"`. Optional. Corresponding to the graph attribute `rankdir` in Graphviz.

The function returns a `Promise<SVGSVGElement>` so that you can await the result and then attach `SVGSVGElement` to the main DOM tree.
