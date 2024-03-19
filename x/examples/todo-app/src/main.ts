import van from "vanjs-core"
import * as vanX from "vanjs-ext"

const {a, button, del, div, input, span} = van.tags

const TodoList = () => {
  interface TodoItem {text: string, done: boolean}
  const items = vanX.reactive(
    (<TodoItem[]>JSON.parse(localStorage.getItem("appState") ?? "[]")))
  van.derive(() => localStorage.setItem("appState", JSON.stringify(vanX.compact(items))))
  const inputDom = input({type: "text"})
  return div(
    inputDom, button({onclick: () => items.push({text: inputDom.value, done: false})}, "Add"),
    vanX.list(div, items, ({val: v}, deleter) => div(
      input({type: "checkbox", checked: () => v.done, onclick: e => v.done = e.target.checked}),
      () => (v.done ? del : span)(v.text),
      a({onclick: deleter}, "❌"),
    )),
  )
}

van.add(document.body, TodoList())
