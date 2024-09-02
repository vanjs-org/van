# **VanGraph**: Helper Library to Visualize Dependency Graph Among States and DOM Nodes

**VanGraph** is a library that helps you visualize dependency graph among states and DOM nodes with the help of [Graphviz](https://graphviz.org/). Here is the sample usage:

```js
const firstName = van.state("Tao"), lastName = van.state("Xin")
const fullName = van.derive(() => `${firstName.val} ${lastName.val}`)

// Build the DOM tree...

// To visualize the dependency graph among `firstName`, `lastName`, `fullName`, and all the
// derived states and DOM nodes from them.
vanGraph.show({firstName, lastName, fullName})
```

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
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.5.2.nomodule.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@viz-js/viz@3.8.0/lib/viz-standalone.js"></script>
```

[Try on jsfiddle](https://jsfiddle.net/1u69nbek/2/)

## Documentation

```js
vanGraph.show(states, options) => Promise<SVGSVGElement>
```

The parameter `states` represents a collection of `State` objects whose dependency graph we want to visualize. All the `State` objects and their dependents will be rendered in the dependency graph. `states` can either be specified as a plain object, e.g.: `{firstName, lastName, fullName}`, or as an array, e.g.: `[firstName, lastName, fullName]`.