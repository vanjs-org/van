import van from "vanjs-core"
import { Modal } from "vanjs-ui"

const {b, button, code, div, form, h1, input, p} = van.tags

const example1 = () => {
  const closed = van.state(false)
  van.add(document.body, Modal({closed},
    p("Hello, World!"),
    div({style: "display: flex; justify-content: center;"},
      button({onclick: () => closed.val = true}, "Ok"),
    ),
  ))
}

const example2 = () => {
  const closed = van.state(false)
  const formDom = form(
    div(input({type: "radio", name: "lang", value: "Zig", checked: true}), "Zig"),
    div(input({type: "radio", name: "lang", value: "Rust"}), "Rust"),
    div(input({type: "radio", name: "lang", value: "Kotlin"}), "Kotlin"),
    div(input({type: "radio", name: "lang", value: "TypeScript"}), "TypeScript"),
    div(input({type: "radio", name: "lang", value: "JavaScript"}), "JavaScript"),
  )

  const onOk = () => {
    const lang = (<HTMLInputElement>formDom.querySelector("input:checked")).value
    alert(lang + " is a good language 😀")
    closed.val = true
  }

  van.add(document.body, Modal({closed, blurBackground: true},
    p("What's your favorite programming language?"),
    formDom,
    p({style: "display: flex; justify-content: space-evenly;"},
      button({onclick: onOk}, "Ok"),
      button({onclick: () => closed.val = true}, "Cancel"),
    )
  ))
}

const ModalDemo = () => {
  return div(
    h1("Modal Demo"),
    p("This is a demo for the ", code("Modal"), " component in ", b("VanUI"), "."),
    p(button({onclick: example1}, "Example 1"), " ", button({onclick: example2}, "Example 2")),
  )
}

van.add(document.body, ModalDemo())
