import van from "vanjs-core"
import Hello from "./components/hello.js"
import Counter from "./components/counter.js"

const {button, p} = van.tags

van.add(document.getElementById("hello-container")!, Hello({van}))

const hydrate = () => {
  van.hydrate(document.getElementById("basic-counter")!, dom => Counter({
    van,
    id: dom.id,
    init: Number(dom.getAttribute("data-counter")),
  }))

  const styleSelectDom = <HTMLSelectElement>document.getElementById("button-style")
  const buttonStyle = van.state(styleSelectDom.value)
  styleSelectDom.oninput = e => buttonStyle.val = (<HTMLSelectElement>e.target).value
  van.hydrate(document.getElementById("styled-counter")!, dom => Counter({
    van,
    id: dom.id,
    init: Number(dom.getAttribute("data-counter")),
    buttonStyle,
  }))
}

van.add(document.getElementById("counter-container")!, p(button({onclick: hydrate}, "Hydrate")))
