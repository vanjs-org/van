import van from "vanjs-core"
import * as vanX from "vanjs-ext"

const {button, code, div, h2, input, sup} = van.tags

const Reactive = () => {
  const base = vanX.reactive({
    a: 1,
    b: 2,
    name: {
      first: "Tao",
      last: "Xin",
    },
    list: [1, 2, 3],
  })

  const aDom = input({type: "number", min: 1, max: 9, value: () => base.a,
    oninput: e => base.a = e.target.value})
  const bDom = input({type: "number", min: 1, max: 9, value: () => base.b,
    oninput: e => base.b = e.target.value})

  const firstNameDom = input({type: "text", value: () => base.name.first,
    oninput: e => base.name.first = e.target.value})
  const lastNameDom = input({type: "text", value: () => base.name.last,
    oninput: e => base.name.last = e.target.value})

  const changeToRandomName = () => {
    const names = [
      {first: "Tao", last: "Xin"},
      {first: "Vanilla", last: "JavaScript"},
      {first: "Van", last: "JS"},
    ]
    base.name = names[Math.floor(Math.random() * names.length)]
  }

  const listDom = input({type: "text", value: () => base.list.toString(),
    oninput: e => base.list = e.target.value.split(",")})

  const derived = vanX.reactive({
    // Derived individual fields
    a: {
      double: vanX.calc(() => base.a * 2),
      squared: vanX.calc(() => base.a * base.a),
    },
    // Derived object
    b: vanX.calc(() => ({
      double: base.b * 2,
      squared: base.b * base.b,
    })),
    fullName: vanX.calc(() => `${base.name.first} ${base.name.last}`),
    list: vanX.calc(() => ({
      length: base.list.length,
      sum: base.list.reduce((acc, val) => acc + Number(val), 0),
    })),
  })

  return div(
    h2("Input"),
    div("a: ", aDom),
    div("b: ", bDom),
    div("First Name: ", firstNameDom, " Last Name: ", lastNameDom, " ",
      button({onclick: changeToRandomName}, "Random Name")),
    div("List: ", listDom),
    h2("Output"),
    div(code(() => `${base.a} * 2 = ${derived.a.double}`)),
    div(code(() => base.a, sup(2), " = ", () => derived.a.squared)),
    div(code(() => `${base.b} * 2 = ${derived.b.double}`)),
    div(code(() => base.b, sup(2), " = ", () => derived.b.squared)),
    div("Name: ", () => `${base.name.first} ${base.name.last}`),
    // Directly using the state object
    div("Full name: ", vanX.stateFields(derived).fullName),
    div("The length of ", () => base.list.toString(), " is ", () => derived.list.length, "."),
    div("The sum of ", () => base.list.toString(), " is ", () => derived.list.sum, "."),
  )
}

van.add(document.body, Reactive())
