import van from "vanjs-core"
import {FloatingWindow} from "vanjs-ui"

const {div, p} = van.tags

const example6 = () => {
  van.add(document.body, FloatingWindow(
    {title: "Not Movable", disableMove: true},
    div({style: "display: flex; justify-content: center;"},
      p("This window is not movable!"),
    ),
  ))
}

export default example6
