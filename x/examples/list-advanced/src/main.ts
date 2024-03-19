import van from "vanjs-core"
import * as vanX from "vanjs-ext"

const {a, button, div, input} = van.tags

const TodoList = () => {
  interface TodoItem { text: string, done: boolean }
  const items = vanX.reactive(
    <Record<string, TodoItem>>JSON.parse(localStorage.getItem("items") ?? "{}"))
  van.derive(() => localStorage.setItem("items", JSON.stringify(vanX.compact(items))))

  const inputDom = input({type: "text"})
  let id = Math.max(0, ...Object.keys(items).map(v => Number(v.slice(1))))

  return div(
    div(inputDom, button(
      {onclick: () => items["k" + ++id] = {text: inputDom.value!, done: false}}, "Add")),
    div(() => Object.keys(items).length, " item(s) in total"),
    vanX.list(div, items, ({val: v}, deleter) => div(
      input({type: "checkbox", checked: () => v.done,
        onclick: e => v.done = e.target.checked}), " ",
      input({
        type: "text", value: () => v.text,
        style: () => v.done ? "text-decoration: line-through;" : "",
        oninput: e => v.text = e.target.value,
      }), " ",
      a({onclick: deleter}, "❌"),
    )),
    div(
      button({onclick: () => vanX.replace(items, l => l.filter(([_, v]) => !v.done))},
        "Clear Completed"),
      button({onclick: () => vanX.replace(items, l =>
        l.toSorted(([_1, a], [_2, b]) => a.text.localeCompare(b.text)))}, "A -> Z"),
      button({onclick: () => vanX.replace(items, l =>
        l.toSorted(([_1, a], [_2, b]) => b.text.localeCompare(a.text)))}, "Z -> A"),
      button({onclick: () => vanX.replace(items, l =>
        l.flatMap(([k1, v1]) => [
          [k1, v1],
          ["k" + ++id, {text: v1.text + " - copy", done: v1.done}],
        ]))},
        "Duplicate List"),
      button({onclick: () => Object.values(items).forEach(v => v.text += "!")}, 'Append "!"'),
    ),
  )
}

van.add(document.body, TodoList())
