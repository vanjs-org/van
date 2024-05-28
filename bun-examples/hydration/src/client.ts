import {vanWrap, vanWrapper} from "mini-van-plate/shared";
import vanOriginal from "vanjs-core";
import Counter from "./components/counter.js";
import Hello from "./components/hello.js";

const hydrate = () => {
  vanOriginal.hydrate(document.getElementById("basic-counter")!, dom => Counter({
    id: dom.id,
    init: Number(dom.getAttribute("data-counter")),
  }))

  const styleSelectDom = <HTMLSelectElement>document.getElementById("button-style")
  const buttonStyle = van.state(styleSelectDom.value)
  styleSelectDom.oninput = e => buttonStyle.val = (<HTMLSelectElement>e.target).value
  vanOriginal.hydrate(document.getElementById("styled-counter")!, dom => Counter({
    id: dom.id,
    init: Number(dom.getAttribute("data-counter")),
    buttonStyle,
  }))
}

vanWrap(vanOriginal, (van) => {
  const {button, p} = van.tags
  van.add(document.getElementById("hello-container")!, Hello({}))
  van.add(document.getElementById("counter-container")!, p(button({onclick: vanWrapper(hydrate)}, "Hydrate")))
})
