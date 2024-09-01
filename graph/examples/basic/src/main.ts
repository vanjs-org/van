import van from "vanjs-core"
import * as vanX from "vanjs-ext"

const {a, button, div, input, li, ul} = van.tags

const List = () => {
  const items = vanX.reactive(<string[]>[])
  const inputDom = input({type: "text"})

  return div(
    div(inputDom, button({onclick: () => items.push(inputDom.value)}, "Add")),
    div(() => Object.keys(items).length, " item(s) in total"),
    vanX.list(ul, items, (v, deleter) => li(v, " ", a({onclick: deleter}, "❌"))),
    div(
      button({onclick: () => vanX.replace(items, l => l.toSorted())}, "A -> Z"),
      button({onclick: () => vanX.replace(items,
        l => l.toSorted((a, b) => b.localeCompare(a)))}, "Z -> A"),
      button({onclick: () => vanX.replace(items, l => l.map(v => v + "!"))}, 'Append "!"'),
    ),
  )
}

van.add(document.body, List())
