# 🍦 **VanJS**: The Smallest Reactive UI Framework in the World

📣 [VanJS 1.0.0 is here →](https://github.com/vanjs-org/van/discussions/72)

<div align="center">
  <table>
    <tbody>
      <tr>
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

> Enable everyone to build useful UI apps with a few lines of code, anywhere, any time, on any device.

**VanJS** is an ***ultra-lightweight***, ***zero-dependency*** and ***unopinionated*** Reactive UI framework based on pure vanilla JavaScript and DOM. Programming with **VanJS** feels like building React apps in a [scripting language](https://vanjs.org/about#story), without JSX. Check-out the `Hello World` code below:

```javascript
// Reusable components can be just pure vanilla JavaScript functions.
// Here we capitalize the first letter to follow React conventions.
const Hello = () => div(
  p("👋Hello"),
  ul(
    li("🗺️World"),
    li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
  ),
)

van.add(document.body, Hello())
// Alternatively, you can write:
// document.body.appendChild(Hello())
```

[Try on jsfiddle](https://jsfiddle.net/gh/get/library/pure/vanjs-org/vanjs-org.github.io/tree/master/jsfiddle/home/hello)

You can convert any HTML snippet into **VanJS** code with our online [converter](https://vanjs.org/convert).

**VanJS** helps you manage states and UI bindings as well, with a more natural API:

```javascript
const Counter = () => {
  const counter = van.state(0)
  return div(
    "❤️ ", counter, " ",
    button({onclick: () => ++counter.val}, "👍"),
    button({onclick: () => --counter.val}, "👎"),
  )
}

van.add(document.body, Counter())
```

[Try on jsfiddle](https://jsfiddle.net/gh/get/library/pure/vanjs-org/vanjs-org.github.io/tree/master/jsfiddle/home/counter)

## Why VanJS?

### Reactive Programming without React/JSX

Declarative DOM tree composition, reusable components, reactive state binding - **VanJS** offers every good aspect that React does, but without the need of React, JSX, transpiling, virtual DOM, or any hidden logic. Everything is built with simple JavaScript functions and DOM.

### Grab 'n Go

***No installation***, ***no configuration***, ***no dependencies***, ***no transpiling***, ***no IDE setups***. Adding a line to your script or HTML file is all you need to start coding. **VanJS** allows you to focus on the business logic of your application, rather than getting bogged down in frameworks and tools.

### Ultra-Lightweight

**VanJS** is a very thin layer on top of Vanilla JavaScript and DOM, barely enough to make the DOM manipulation and state binding as ergonomic as (if not more than) React, and it delegates most of work to standard browser APIs implemented in native code. As a result, the bundled size of **VanJS** is just 1.7kB (0.9kB gzipped), which is **50~100 times** smaller than most popular UI frameworks, making it the smallest reactive UI framework in the world:

![Size comparison](doc/size_comp.png)

> _Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away._
>
> _-- Antoine de Saint-Exupéry, Airman's Odyssey_

### TypeScript Support

**VanJS** provides first-class support for TypeScript. Simply download the corresponding `.d.ts` file along with your `.js` file, and you'll be able to take advantage of type-checking, IntelliSense, large-scale refactoring provided by your preferred development environment. Refer to the [Download Table](https://vanjs.org/start#download-table) to find the right `.d.ts` file to work with.

### Easy to Learn

Simplicity at its core. 4 major functions (`van.tags`, `van.add`, `van.state`, `van.derive`) + 4 auxiliary functions (`van.tagsNS`, `van._`, `van.val`, `van.oldVal`). The [walkthrough tutorial](https://vanjs.org/tutorial) is the same as the full API reference, and can be learned within 1 hour for most developers.

## Want to Learn More?

* [Get Started](https://vanjs.org/start) (CDN, NPM or local download)
* Learn from the [Tutorial](https://vanjs.org/tutorial)
* Learn by [Examples](https://vanjs.org/demo) (and also [Community Examples](https://vanjs.org/demo#community-examples))
* Convert HTML snippet to **VanJS** code with our online [HTML to **VanJS** Converter](https://vanjs.org/convert)
* Check out [VanUI](https://github.com/vanjs-org/van/tree/main/components) - A collection of grab 'n go reusable UI components for **VanJS**
* Want server-side rendering? Check out [Mini-Van](https://github.com/vanjs-org/mini-van) (the entire [vanjs.org](https://vanjs.org/) site is built on top of Mini-Van)
* For questions, feedback or general discussions, visit our [Discussions](https://github.com/vanjs-org/van/discussions) page
* [How did **VanJS** get its name?](https://vanjs.org/about#name)

## Support & Feedback

🙏 **VanJS** aims to build a better world by reducing the entry barrier for UI programming, with no intention or plan on commercialization whatsoever. If you find **VanJS** interesting, or could be useful for you some day, please consider starring the project. It takes just a few seconds but your support means the world to us and helps spread **VanJS** to a wider audience.

> In the name of **Van**illa of the House **J**ava**S**cript, [the First of its name](https://vanjs.org/about#name), Smallest Reactive UI Framework, 0.9kB JSX-free Grab 'n Go Library, [Scripting Language](https://vanjs.org/about#story) for GUI, [ChatGPT-Empowered](https://chat.openai.com/share/d92cfaf6-b78e-45ca-a218-069f76fe1b9f) Toolkit, by the word of Tao of the House Xin, Founder and Maintainer of **VanJS**, I do hereby grant you the permission of **VanJS** under [MIT License](https://github.com/vanjs-org/van/blob/main/LICENSE).

Contact us: [@taoxin](https://twitter.com/intent/follow?region=follow_link&screen_name=taoxin) / [tao@vanjs.org](mailto:tao@vanjs.org) / [Tao Xin](https://www.linkedin.com/in/tao-xin-64234920/)

## Community Add-ons

**VanJS** can be extended via add-ons. Add-ons add more features to **VanJS** and/or provide an alternative styled API. Below is a curated list of add-ons built by **VanJS** community:

* [van_dml.js](https://github.com/vanjs-org/van/tree/main/addons/van_dml): adds a a new flavour of composition to **VanJS**. Author: [Eckehard](https://github.com/efpage).
* [van-jsx](https://github.com/vanjs-org/van/tree/main/addons/van_jsx): a JSX wrapper for **VanJS**, for people who like the JSX syntax more. Author: [cqh963852](https://github.com/cqh963852).

## Contributors (15)

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ryanolsonx"><img src="https://avatars.githubusercontent.com/u/238929?v=4?s=100" width="100px;" alt="Ryan Olson"/><br /><sub><b>Ryan Olson</b></sub></a><br /><a href="#content-ryanolsonx" title="Content">🖋</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

*Some authors can't be recognized by Github as contributors for weird reasons (e.g.: [1](https://github.com/vanjs-org/van/pull/29#issuecomment-1583616491), [2](https://github.com/vanjs-org/van/pull/40#issuecomment-1585307358)). Their names are shown here. Authors are ordered chronologically by first contribution:*

* [Tao Xin](https://github.com/Tao-VanJS)
* [Ryan Olson](https://github.com/ryanolsonx)
* [Tamotsu Takahashi](https://github.com/tamo)
* [icecream17](https://github.com/icecream17)
* [enpitsuLin](https://github.com/enpitsuLin)
* [Elliot Ford](https://github.com/EFord36)
* [andrewgryan](https://github.com/andrewgryan)
* [FredericHeem](https://github.com/FredericHeem)
* [ebraminio](https://github.com/ebraminio)
* [Eckehard](https://github.com/efpage)
* [Austin Merrick](https://github.com/onsclom)
* [Lee Byonghun](https://github.com/Tolluset)
* [caputdraconis](https://github.com/caputdraconis050630)
* [Achille Lacoin](https://github.com/pomdtr)
* [cqh963852](https://github.com/cqh963852)
