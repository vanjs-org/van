import van from "vanjs-core"
import {FloatingWindow} from "vanjs-ui"

const {div, p} = van.tags

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

export default example2
