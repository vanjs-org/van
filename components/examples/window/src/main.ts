import van from "vanjs-core"
import { FloatingWindow, Tabs } from "vanjs-ui"

export type CSSPropertyBag = Record<string, string | number>

const toStyleStr = (style: CSSPropertyBag) =>
  Object.entries(style).map(([k, v]) => `${k}: ${v};`).join("")

const { button, div, h1, p, a, b, code, pre, span, style } = van.tags
const example1 = () => {
  const closed = van.state(false)
  const x = van.state(100)
  const y = van.state(100)
  const width = van.state(300)
  const height = van.state(200)

  van.add(document.body, FloatingWindow({
    title: "Example Window 1",
    closed,
    x,
    y,
    width,
    height
  },
    div({ style: "padding: 1rem;" },
      p("Hello, World!"),
      div({ style: "display: flex; justify-content: center;" },
        button({ onclick: () => closed.val = true }, "Close Window"),
      ),
    )
  ))
}

const example2 = () => {
  const closed = van.state(false)
  const x = van.state(150)
  const y = van.state(150)
  const width = van.state(300)
  const height = van.state(200)

  van.add(document.body, FloatingWindow({
    title: "Example Window 2",
    closed,
    x,
    y,
    width,
    height,
    closeCross: true,
    headerStyleOverrides: {
      "background-color": "lightblue",
    }
  },
    div({ style: "display: flex; justify-content: center;" },
      p("This is another floating window!"),
    )
  ))
}

const example3 = () => {
  const closed = van.state(false)
  const x = van.state(200)
  const y = van.state(200)
  const width = van.state(500)
  const height = van.state(300)

  van.add(document.body, FloatingWindow({
    title: "Example Window 3",
    closed,
    x,
    y,
    width,
    height,
    closeCross: true,
    windowStyleOverrides: {
      "background-color": "lightgray",
      padding: "0px",
    },
    headerStyleOverrides: {
      display: "none",
    },

  },
    div(
      span({
        style: toStyleStr({
          position: "absolute",
          top: "0px",
          right: "0px",
          padding: "0.5rem",
          cursor: "pointer",
          height: "1.2rem",
        }),
        class: "custom-cross",
        onclick: () => closed.val = true,
      }, "×"),
      style({ type: "text/css" }, `
      .custom-cross:hover {${toStyleStr({
        "background-color": "red",
        color: "white",
      })}`),
      Tabs(
        {
          style: toStyleStr({
            width: "100%",
          }),
          tabButtonActiveColor: "white",
          tabButtonBorderStyle: "none",
          tabButtonRowStyleOverrides: {
            "background-color": "lightblue",
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
            a({ href: "https://github.com/Tao-VanJS" }, " Tao Xin"), "."
          ),
        },
      )
    )
  ))
}

const example4 = () => {
  const closed = van.state(false)
  const x = van.state(300)
  const y = van.state(300)
  const width = van.state(500)
  const height = van.state(300)

  van.add(document.body, FloatingWindow({
    title: "Example Window 4",
    closed,
    x,
    y,
    width,
    height,
    closeCross: true,
    windowStyleOverrides: {
      "background-color": "lightgray",
      padding: "0px",
      border: "1px solid red",
    },
    headerStyleOverrides: {
      display: "none",
    },
    childrenContainerStyleOverrides: {
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      height: "100%",
    }
  },
    button({ onclick: () => closed.val = true }, "Close Window"),
  ))
}


const FloatingWindowDemo = () => {
  return div(
    h1("FloatingWindow Demo"),
    p("This is a demo for the ", "FloatingWindow", " component."),
    p(
      button({ onclick: example1 }, "Window with custom close button"), " ",
      button({ onclick: example2 }, "Window with integrated close button"), " ",
      button({ onclick: example3 }, "Window with Tabs with custom close button"),
      button({ onclick: example4 }, "Window without header and with custom close button"),
    ),
  )
}

van.add(document.body, FloatingWindowDemo())
