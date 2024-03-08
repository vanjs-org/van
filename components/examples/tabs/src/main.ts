import van from "vanjs-core"
import { Tabs } from "vanjs-ui"

const {a, b, code, p, pre} = van.tags

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
      "The author of ", b("VanJS"), " is ",
      a({href: "https://github.com/Tao-VanJS"}, " Tao Xin"), "."
    ),
  },
))
