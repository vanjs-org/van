import navbar from "./app/navbar"
import van from "vanjs-core"
import context from "./context"

const { routerElement } = context

const Navbar = navbar()

const App = () =>
  van.tags.div(
    Navbar(),
    routerElement
  )

document.body.replaceChildren(App())
