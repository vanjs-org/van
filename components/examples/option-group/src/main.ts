import van from "vanjs-core"
import { OptionGroup } from "vanjs-ui"

const {b, p, span} = van.tags

const selected = van.state("")
const options = ["Water", "Coffee", "Juice"]

van.add(document.body,
  p("What would you like to drink?"),
  OptionGroup({selected}, options),
  p(() => options.includes(selected.val) ?
    span(b("You selected:"), " ", selected) : b("You haven't selected anything.")),
)
