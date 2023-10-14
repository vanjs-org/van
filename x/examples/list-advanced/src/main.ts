import van from "vanjs-core"
import * as vanX from "vanjs-ext"

const {a, button, div, input} = van.tags

const TodoList = () => {
  interface TodoItem { text: string, done: boolean }
  const data = vanX.reactive({
    items: <Record<string, TodoItem>>JSON.parse(localStorage.getItem("items") ?? "{}"),
  })
  van.derive(() => JSON.stringify(data.items))

  const inputDom = input({type: "text"})
  let id = 0

  const addItem = (text: string) => data.items = Object.fromEntries(
    Object.entries(data.items).concat([["k" + ++id, {text, done: false}]])
  )

  const clearCompleted = () => data.items = Object.fromEntries(
    Object.entries(data.items).filter((([_, v]) => !v.done))
  )

  const aToZ = () => data.items = Object.fromEntries(
    Object.entries(data.items).toSorted(([_1, a], [_2, b]) => a.text.localeCompare(b.text)),
  )

  const zToA = () => data.items = Object.fromEntries(
    Object.entries(data.items).toSorted(([_1, a], [_2, b]) => b.text.localeCompare(a.text)),
  )

  const duplicateList = () => data.items = Object.fromEntries(
    Object.entries(data.items).flatMap(([k, v]) => [
      [k, v],
      ["k" + ++id, {text: v.text + " - copy", done: v.done}],
    ])
  )

  const append = () => Object.entries(data.items).forEach(([_, v]) => v.text += "!")

  return div(
    div(inputDom, button({onclick: () => addItem(inputDom.value)}, "Add")),
    vanX.list(div, vanX.stateFields(data).items, ({val: v}, deleter) => {
      return div(
        input({type: "checkbox", checked: () => v.done,
          onclick: e => v.done = e.target.checked}), " ",
        input({
          type: "text", value: () => v.text,
          style: () => v.done ? "text-decoration: line-through;" : "",
          oninput: e => v.text = e.target.value,
        }, () => v.text), " ",
        a({onclick: deleter}, "❌"),
      )
    }),
    div(
      button({onclick: clearCompleted}, "Clear Completed"),
      button({onclick: aToZ}, "A -> Z"),
      button({onclick: zToA}, "Z -> A"),
      button({onclick: duplicateList}, "Duplicate List"),
      button({onclick: append}, "Append"),
    ),
  )
}

van.add(document.body, TodoList())
