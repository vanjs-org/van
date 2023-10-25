import van from "vanjs-core"
import {FloatingWindow} from "vanjs-ui"

const {button, div, p} = van.tags

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

export default example7
