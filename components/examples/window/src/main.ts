import van from "vanjs-core"
import {example1, example2, example3, example4, example5, example6, example7, example8} from './example';

const {button, div, h1, p} = van.tags

const FloatingWindowDemo = () => {
  return div(
    h1("FloatingWindow Demo"),
    p("This is a demo for the ", "FloatingWindow", " component."),
    p(
      button({onclick: example1}, "Window with custom close button"), " ",
      button({onclick: example2}, "Window with integrated close button"), " ",
      button({onclick: example3}, "Window with Tabs and custom close button"), " ",
      button({onclick: example4}, "Window without header or custom close button"), " ",
      button({onclick: example5}, "Window with custom z-index"), " ",
      button({onclick: example6}, "Non-movable window"), " ",
      button({onclick: example7}, "Non-movable window without title"), " ",
      button({onclick: example8}, "Non-resizable window"),
    ),
  )
}

van.add(document.body, FloatingWindowDemo())
