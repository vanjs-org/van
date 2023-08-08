// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, _undefined, protoOf = Object.getPrototypeOf

let addAndScheduleOnFirst = (set, s, func, waitMs) =>
  (set ?? (setTimeout(func, waitMs), new Set)).add(s)

let changedStates

let stateProto = {
  get "val"() { return this._val },

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
  },

  "onnew"(l) { this.listeners.push(l) },
}

// stateProto is a plain object thus protoOf(stateProto) is just Object.prototype.
// protoOf(stateProto) is equivalent to protoOf({}) but saves 1 byte in the minized bundle.
let objProto = protoOf(stateProto)

let state = initVal => ({
  __proto__: stateProto,
  _val: initVal,
  oldVal: initVal,
  bindings: [],
  listeners: [],
})

let toDom = v => v.nodeType ? v : new Text(v)

let add = (dom, ...children) => (
  children.flat(Infinity).forEach(child => dom.appendChild(
    protoOf(child) === stateProto ? bind(child, v => v) : toDom(child))),
  dom)

let tags = new Proxy((name, ...args) => {
  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args]
  let dom = document.createElement(name)
  Obj.entries(props).forEach(([k, v]) => {
    let setter = dom[k] !== _undefined ? v => dom[k] = v : v => dom.setAttribute(k, v)
    if (protoOf(v) === stateProto) bind(v, v => (setter(v), dom))
    else if (protoOf(v) === objProto) bind(...v["deps"], (...deps) => (setter(v["f"](...deps)), dom))
    else setter(v)
  })
  return add(dom, ...children)
}, {get: (tag, name) => tag.bind(_undefined, name)})

let filterBindings = s => s.bindings = s.bindings.filter(b => b.dom?.isConnected)

let updateDoms = () => {
  let changedStatesArray = [...changedStates]
  changedStates = _undefined
  new Set(changedStatesArray.flatMap(filterBindings)).forEach(b => {
    let {_deps, dom, func} = b
    let newDom = func(..._deps.map(d => d._val), dom, ..._deps.map(d => d.oldVal))
    if (newDom !== dom)
      if (newDom != _undefined)
        dom.replaceWith(b.dom = toDom(newDom)); else dom.remove(), b.dom = _undefined
  })
  changedStatesArray.forEach(s => s.oldVal = s._val)
}

let bindingGcCycleInMs = 1000
let statesToGc

let bind = (...deps) => {
  let [func] = deps.splice(-1, 1)
  let result = func(...deps.map(d => d._val))
  if (result == _undefined) return []
  let binding = {_deps: deps, dom: toDom(result), func}
  deps.forEach(s => {
    statesToGc = addAndScheduleOnFirst(statesToGc, s,
      () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
      bindingGcCycleInMs)
    s.bindings.push(binding)
  })
  return binding.dom
}

export default {add, tags, state, bind}
