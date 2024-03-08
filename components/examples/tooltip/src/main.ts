import van from "vanjs-core"
import { Tooltip } from "vanjs-ui"

const {button, h1} = van.tags

van.add(document.body, h1("Tooltip Examples"))

const tooltip1Show = van.state(false)
const tooltip2Show = van.state(false)
const count = van.state(0)
const tooltip2Text = van.derive(() => `Count: ${count.val}`)
const tooltip3Show = van.state(false)

van.add(document.body,
  button({
    style: "position: relative;",
    onmouseenter: () => tooltip1Show.val = true,
    onmouseleave: () => tooltip1Show.val = false,
  }, "Normal Tooltip", Tooltip({text: "Hi!", show: tooltip1Show})), " ",
  button({
    style: "position: relative;",
    onmouseenter: () => tooltip2Show.val = true,
    onmouseleave: () => tooltip2Show.val = false,
    onclick: () => ++count.val
  }, "Increment Counter", Tooltip({text: tooltip2Text, show: tooltip2Show})), " ",
  button({
    style: "position: relative;",
    onmouseenter: () => tooltip3Show.val = true,
    onmouseleave: () => tooltip3Show.val = false,
  }, "Slow Fade-in", Tooltip({text: "Hi from the sloth!", show: tooltip3Show, fadeInSec: 5})),
)
