import van from "vanjs-core"
import {FloatingWindow} from "vanjs-ui"

const {button, p} = van.tags

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

export default example5
