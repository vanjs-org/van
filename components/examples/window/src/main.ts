import van from "vanjs-core"

import { example1, example2, example3, example4, example5 } from './example';

const { button, div, h1, p } = van.tags


const FloatingWindowDemo = () => {
  return div(
    h1("FloatingWindow Demo"),
    p("This is a demo for the ", "FloatingWindow", " component."),
    p(
      button({ onclick: example1 }, "Window with custom close button"), " ",
      button({ onclick: example2 }, "Window with integrated close button"), " ",
      button({ onclick: example3 }, "Window with Tabs with custom close button"),
      button({ onclick: example4 }, "Window without header and with custom close button"),
      button({ onclick: example5 }, "Window with custom z-index"),
    ),
  )
}

van.add(document.body, FloatingWindowDemo())
