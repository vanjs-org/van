import van from "vanjs-core"
import {FloatingWindow, Tabs} from "vanjs-ui";

const {a, b, button, code, div, h1, p, pre, span} = van.tags

const example1 = () => {
  const closed = van.state(false)
  const width = van.state(300), height = van.state(220)

  van.add(document.body, FloatingWindow(
    {title: "Example Window 1", closed, width, height, closeCross: null},
    div({style: "padding: 1rem;"},
      p("Hello, World!"),
      p({style: "display: flex; justify-content: center;"},
        button({onclick: () => width.val *= 2}, "Double Width"),
      ),
      p({style: "display: flex; justify-content: center;"},
        button({onclick: () => height.val *= 2}, "Double Height"),
      ),
      p({style: "display: flex; justify-content: center;"},
        button({onclick: () => closed.val = true}, "Close Window"),
      ),
    )
  ))
}

const example2 = () => {
  van.add(document.body, FloatingWindow(
    {
      title: "Example Window 2", x: 150, y: 150,
      headerStyleOverrides: {
        "background-color": "lightblue",
      },
    },
    div({style: "display: flex; justify-content: center;"},
      p("This is another floating window!"),
    )
  ))
}

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

const example4 = () => {
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
}

const example5 = () => {
  const closed = van.state(false)
  const zIndex = van.state(1)

  van.add(document.body, FloatingWindow(
    {
      closed,
      x: 300,
      y: 300,
      width: 300,
      height: 100,
      title: "Custom z-index",
      childrenContainerStyleOverrides: {
        display: "flex",
        "justify-content": "space-between",
      },
      zIndex: zIndex,
    },
    button({onclick: () => zIndex.val++}, "+"),
    p("z-index: ", zIndex),
    button({onclick: () => zIndex.val--}, "-"),
  ))
}

const example6 = () => {
  van.add(document.body, FloatingWindow(
    {title: "Not Movable", disableMove: true},
    div({style: "display: flex; justify-content: center;"},
      p("This window is not movable!"),
    ),
  ))
}

const example7 = () => {
  const closed = van.state(false)

  van.add(document.body, FloatingWindow(
    {closed, x: 150, y: 150, disableMove: true},
    div(
      p({style: "display: flex; justify-content: center;"}, "This window is not movable!"),
      p({style: "display: flex; justify-content: center;"},
        button({onclick: () => closed.val = true}, "Close")
      ),
    ),
  ))
}

const example8 = () => {
  van.add(document.body, FloatingWindow(
    {title: "Not Resizable", x: 200, y: 200, disableResize: true},
    div(
      p({style: "display: flex; justify-content: center;"}, "This window is not resizable!"),
    ),
  ))
}

const FloatingWindowDemo = () => {
  return div(
    h1("FloatingWindow Demo"),
    p("This is a demo for the ", code("FloatingWindow"), " component in ", b("VanUI"), "."),
    p(
      button({onclick: example1}, "Window with custom close button"), " ",
      button({onclick: example2}, "Window with integrated close button"), " ",
      button({onclick: example3}, "Window with Tabs and custom close button"), " ",
      button({onclick: example4}, "Window without header or integrated close button"), " ",
      button({onclick: example5}, "Window with custom z-index"), " ",
      button({onclick: example6}, "Non-movable window"), " ",
      button({onclick: example7}, "Non-movable window without title"), " ",
      button({onclick: example8}, "Non-resizable window"),
    ),
  )
}

van.add(document.body, FloatingWindowDemo())
