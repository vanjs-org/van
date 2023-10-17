import van from "vanjs-core"
import * as vanX from "vanjs-ext"

const {a, button, div, input} = van.tags

const TodoList = () => {
  interface TodoItem { text: string, done: boolean }
  const items = vanX.reactive(
    <Record<string, TodoItem>>JSON.parse(localStorage.getItem("items") ?? "{}"))
  van.derive(() => localStorage.setItem("items", JSON.stringify(items)))

  const inputDom = input({type: "text"})
  let id = Math.max(...Object.keys(items).map(v => Number(v.slice(1))))

  return div(
    div(inputDom, button(
      {onclick: () => items["k" + ++id] = {text: inputDom.value!, done: false}}, "Add")),
    vanX.list(div, items, ({val: v}, deleter) => {
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
      button({onclick: () => vanX.replace(items, l => l.filter(([_, v]) => !v.done))},
        "Clear Completed"),
      button({onclick: () => vanX.replace(items, l =>
        l.sort(([_1, {text: t1}], [_2, {text: t2}]) => t1.localeCompare(t2)))},
        "A -> Z"),
      button({onclick: () => vanX.replace(items, l =>
        l.sort(([_1, {text: t1}], [_2, {text: t2}]) => t2.localeCompare(t1)))},
        "Z -> A"),
      button({onclick: () => vanX.replace(items, l =>
        l.flatMap(([k1, v1]) => [
          [k1, v1],
          ["k" + ++id, {text: v1.text + " - copy", done: v1.done}]
        ]))
      }, "Duplicate List"),
      button({onclick: () => Object.values(items).forEach(v => v.text += "!")}, 'Append "!"'),
    ),
  )
}

van.add(document.body, TodoList())
