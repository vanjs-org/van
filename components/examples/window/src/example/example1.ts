import van from "vanjs-core"
import {FloatingWindow} from "vanjs-ui"

const {button, div, p} = van.tags

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

export default example1
