import van from "vanjs-core"
import {FloatingWindow, Tabs} from "vanjs-ui"

const {div, p, a, b, code, pre, span} = van.tags

const example3 = () => {
  const closed = van.state(false)

  van.add(document.body, FloatingWindow(
    {closed, x: 200, y: 200, width: 500, height: 300},
    div(
      span({
        style:
          "position: absolute; top: 8px; right: 8px;" +
          "cursor: pointer;",
        class: "vanui-window-cross",
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
}

export default example3