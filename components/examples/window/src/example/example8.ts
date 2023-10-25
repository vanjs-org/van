import van from "vanjs-core"
import {FloatingWindow} from "vanjs-ui"

const {div, p} = van.tags

const example8 = () => {
  van.add(document.body, FloatingWindow(
    {title: "Not Resizable", x: 200, y: 200, disableResize: true},
    div(
      p({style: "display: flex; justify-content: center;"}, "This window is not resizable!"),
    ),
  ))
}

export default example8
