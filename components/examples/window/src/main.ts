import van from "vanjs-core"
import {FloatingWindow, Tabs, topMostZIndex} from "vanjs-ui";

const {a, b, button, code, div, h1, p, pre, span} = van.tags

const example1 = () => {
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
}

const example2 = () => {
  van.add(document.body, FloatingWindow(
    {title: "Example Window 2", x: 150, y: 150, headerColor: "lightblue"},
    div({style: "display: flex; justify-content: center;"},
      p("This is another floating window!"),
    ),
  ))
}

const example3 = () => {
  van.add(document.body, FloatingWindow(
    {
      title: "Example Window 3", x: 175, y: 175, closeCross: "❌",
      crossHoverStyleOverrides: {"background-color": "white"},
    },
    div({style: "display: flex; justify-content: center;"},
      p("This is a floating window with custom cross button!"),
    ),
  ))
}

const example4 = () => {
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
}

const example5 = () => {
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

const example6 = () => {
  const zIndex = van.state(1)

  van.add(document.body, FloatingWindow(
    {title: ["z-index: ", zIndex], x: 200, y: 200, width: 300, height: 100, zIndex},
  ))
}

const example7 = () => {
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
}

const example8 = () => {
  van.add(document.body, FloatingWindow(
    {title: "Not Movable", disableMove: true},
    div({style: "display: flex; justify-content: center;"},
      p("This window is not movable!"),
    ),
  ))
}

const example9 = () => {
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
}

const example10 = () => {
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
      button({onclick: example3}, "Close button with custom appearance"), " ",
      button({onclick: example4}, "Window with Tabs"), " ",
      button({onclick: example5}, "Window without header or integrated close button"), " ",
      button({onclick: example6}, "Window showing z-index"), " ",
      button({onclick: example7}, "Window with custom stacking"), " ",
      button({onclick: example8}, "Non-movable window"), " ",
      button({onclick: example9}, "Non-movable window without title"), " ",
      button({onclick: example10}, "Non-resizable window"),
    ),
  )
}

van.add(document.body, FloatingWindowDemo())
