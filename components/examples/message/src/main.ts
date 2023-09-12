import van from "vanjs-core"
import { MessageBoard } from "vanjs-ui"

const {a, button} = van.tags

const board = new MessageBoard({top: "20px"})

const example1 = () => board.show({message: "Hi!", durationSec: 1})
const example2 = () => board.show(
  {message: ["Welcome to ", a({href: "https://vanjs.org/", style: "color: #0099FF"}, "🍦VanJS"), "!"], closer: "❌"})

const closed = van.state(false)
const example3 = () => {
  closed.val = false
  board.show({message: "Press ESC to close this message", closed})
}
document.addEventListener("keydown", e => e.key === "Escape" && (closed.val = true))

van.add(document.body,
  button({onclick: example1}, "Example 1"), " ",
  button({onclick: example2}, "Example 2"), " ",
  button({onclick: example3}, "Example 3"), " ",
  button({onclick: () => board.remove()}, "Remove Message Board")
)
