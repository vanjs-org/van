import van from "vanjs-core"
import { Banner } from "vanjs-ui"

const {a, div, h2, p} = van.tags

van.add(document.body,
  h2("Sticky Banner"),
  div({style: "width: 300px; height: 200px; overflow-y: auto; border: 1px solid #000;"},
    Banner({sticky: true}, "👋Hello 🗺️World"),
    div({style: "padding: 0 10px"}, Array.from({length: 10}).map((_, i) => p("Line ", i))),
  ),
  h2("Non-sticky Banner"),
  div({style: "width: 300px; height: 200px; overflow-y: auto; border: 1px solid #000;"},
    Banner({sticky: false}, "👋Hello ", a({href: "https://vanjs.org/"}, "🍦VanJS")),
    div({style: "padding: 0 10px"}, Array.from({length: 10}).map((_, i) => p("Line ", i))),
  ),
)
