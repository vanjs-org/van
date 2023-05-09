// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, Null = null

let addAndScheduleOnFirst = (set, s, func, waitMs) =>
  (set ?? (setTimeout(func, waitMs), new Set)).add(s)

let changedStates

class State {
  constructor(v) {
    // Aliasing `this` to reduce the bundle size.
    let s = this
    s._val = s.oldVal = v
    s.bindings = []
    s.listeners = []
  }

  get "val"() { return this._val }

  set "val"(v) {
    // Aliasing `this` to reduce the bundle size.
    let s = this, curV = s._val
    if (v !== curV) {
      if (s.oldVal === curV)
        changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms)
      else if (v === s.oldVal)
        changedStates.delete(s)
      s._val = v
      s.listeners.forEach(l => l(v, curV))
    }
  }

  "onnew"(l) { this.listeners.push(l) }
}

let state = initVal => new State(initVal)

let toDom = v => v.nodeType ? v : new Text(v)

let add = (dom, ...children) => 
  children.flat(Infinity).forEach(child => dom.appendChild(
    child instanceof State ? bind(child, v => v) : toDom(child)))

let tags = new Proxy((name, ...args) => {
  let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args]
  let dom = document.createElement(name)
  Obj.entries(props).forEach(([k, v]) => {
    let setter = dom[k] !== undefined ? v => dom[k] = v : v => dom.setAttribute(k, v)
    if (v instanceof State) bind(v, v => (setter(v), dom))
    else if (v.constructor === Obj) bind(...v["deps"], (...deps) => (setter(v["f"](...deps)), dom))
    else setter(v)
  })
  add(dom, ...children)
  return dom
}, {get: (tag, name) => tag.bind(Null, name)})

let filterBindings = s => s.bindings = s.bindings.filter(b => b.dom?.isConnected)

let updateDoms = () => {
  let changedStatesArray = [...changedStates]
  changedStates = Null
  new Set(changedStatesArray.flatMap(filterBindings)).forEach(b => {
    let {_deps, dom, func} = b
    let newDom = func(..._deps.map(d => d._val), dom, ..._deps.map(d => d.oldVal))
    if (newDom !== dom)
      if (newDom !== Null) dom.replaceWith(b.dom = toDom(newDom)); else dom.remove(), b.dom = Null
  })
  changedStatesArray.forEach(s => s.oldVal = s._val)
}

let bindingGcCycleInMs = 1000
let statesToGc

let bind = (...args) => {
  let deps = args.slice(0, -1), func = args[args.length - 1]
  let result = func(...deps.map(d => d._val))
  if (result === Null) return []
  let binding = {_deps: deps, dom: toDom(result), func}
  deps.forEach(s => {
    statesToGc = addAndScheduleOnFirst(statesToGc, s,
      () => (statesToGc.forEach(filterBindings), statesToGc = Null),
      bindingGcCycleInMs)
    s.bindings.push(binding)
  })
  return binding.dom
}

export default {add, tags, state, bind}