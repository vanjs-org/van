// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, _undefined, protoOf = Obj.getPrototypeOf, doc = document

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
      for (let l of s.listeners) l(v, curV)
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

let add = (dom, ...children) => {
  for (let child of children.flat(Infinity)) if (child != _undefined)
    dom.appendChild(protoOf(child) === stateProto ? bind(child, v => v) : toDom(child))
  return dom
}

let isSettablePropCache = {}

let getPropDescriptor = (proto, key) => proto ?
  Obj.getOwnPropertyDescriptor(proto, key) ?? getPropDescriptor(protoOf(proto), key) :
  _undefined

let isSettableProp = (tag, key, proto) => isSettablePropCache[tag + "," + key] ??
    (isSettablePropCache[tag + "," + key] = getPropDescriptor(proto, key)?.set ?? 0)

let tagsNS = ns => new Proxy((name, ...args) => {
  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args]
  let dom = ns ? doc.createElementNS(ns, name) : doc.createElement(name)
  for (let [k, v] of Obj.entries(props)) {
    let setter = isSettableProp(name, k, protoOf(dom)) ? v => dom[k] = v : v => dom.setAttribute(k, v)
    if (protoOf(v) === stateProto) bind(v, v => (setter(v), dom))
    else if (protoOf(v) === objProto) bind(...v["deps"], (...deps) => (setter(v["f"](...deps)), dom))
    else setter(v)
  }
  return add(dom, ...children)
}, {get: (tag, name) => tag.bind(_undefined, name)})

let filterBindings = s => s.bindings = s.bindings.filter(b => b.dom?.isConnected)

let getVals = deps => deps.map(d => protoOf(d ?? 0) === stateProto ? d._val : d)
let getOldVals = deps => deps.map(d => protoOf(d ?? 0) === stateProto ? d.oldVal : d)

let updateDoms = () => {
  let changedStatesArray = [...changedStates]
  changedStates = _undefined
  for (let b of new Set(changedStatesArray.flatMap(filterBindings))) {
    let {_deps, dom} = b
    let newDom = b.func(...getVals(_deps), dom, ...getOldVals(_deps))
    if (newDom !== dom)
      if (newDom != _undefined)
        dom.replaceWith(b.dom = toDom(newDom)); else dom.remove(), b.dom = _undefined
  }
  for (let s of changedStatesArray) s.oldVal = s._val
}

let bindingGcCycleInMs = 1000
let statesToGc

let bind = (...deps) => {
  let func = deps.pop()
  let result = func(...getVals(deps))
  if (result == _undefined) return []
  let binding = {_deps: deps, dom: toDom(result), func}
  for (let s of deps) if (protoOf(s ?? 0) === stateProto) {
    statesToGc = addAndScheduleOnFirst(statesToGc, s,
      () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
      bindingGcCycleInMs)
    s.bindings.push(binding)
  }
  return binding.dom
}

export default {add, tags: tagsNS(), "tagsNS": tagsNS, state, bind}
