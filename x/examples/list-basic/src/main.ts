import van from "vanjs-core"
import * as vanX from "vanjs-ext"

const {a, button, div, input, li, ul} = van.tags

const List = () => {
  const data = vanX.reactive({items: <string[]>[]})
  const inputDom = input({type: "text"})

  return div(
    div(inputDom, button({onclick: () => data.items = data.items.concat(inputDom.value)}, "Add")),
    vanX.list(ul, vanX.stateFields(data).items,
      (v, deleter) => li(v, " ", a({onclick: deleter}, "❌"))
    ),
    div(
      button({onclick: () => data.items = data.items.filter(() => 1).toSorted()}, "A -> Z"),
      button({onclick: () => data.items =
        data.items.filter(() => 1).toSorted((a, b) => b.localeCompare(a))}, "Z -> A"),
      button({onclick: () => data.items = data.items.map(v => v + "!")}, "Append"),
    ),
  )
}

van.add(document.body, List())
