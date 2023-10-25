import van from "vanjs-core"
import {FloatingWindow} from "vanjs-ui"

const {button} = van.tags

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

export default example4
