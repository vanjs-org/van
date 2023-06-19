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
// protoOf(stateProto) is equivalent to protoOf({}) but saves 1 byte in the minified bundle.
let objProto = protoOf(stateProto)

let state = initVal => ({
  __proto__: stateProto,
  _val: initVal,
  oldVal: initVal,
  bindings: [],
  listeners: [],
})

let isState = s => protoOf(s ?? 0) === stateProto

let val = s => isState(s) ? s._val : s
let vals = deps => deps.map(val)
let oldVals = deps => deps.map(s => isState(s) ? s.oldVal : s)

let toDom = v => v.nodeType ? v : new Text(v)

let add = (dom, ...children) => {
  for (let child of children.flat(Infinity)) if (val(child) != _undefined)
    dom.appendChild(protoOf(child) === stateProto ? bind(child, v => v) : toDom(child))
  return dom
}

let isPropSettableCache = {}

let tagsNS = ns => new Proxy((name, ...args) => {
  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args]
  let dom = ns ? doc.createElementNS(ns, name) : doc.createElement(name)
  for (let [k, v] of Obj.entries(props)) {
    let getPropDescriptor = proto => proto ?
      Obj.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) :
      _undefined
    let cacheKey = name + "," + k
    let isPropSettable = isPropSettableCache[cacheKey] ??
      (isPropSettableCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0)
    let setter = isPropSettable ? v => dom[k] = v : v => dom.setAttribute(k, v)
    if (protoOf(v) === stateProto) bind(v, v => (setter(v), dom))
    else if (protoOf(v) === objProto) bind(...v["deps"], (...deps) => (setter(v["f"](...deps)), dom))
    else setter(v)
  }
  return add(dom, ...children)
}, {get: (tag, name) => tag.bind(_undefined, name)})

let filterBindings = s => s.bindings = s.bindings.filter(b => b.dom?.isConnected)

let updateDoms = () => {
  let changedStatesArray = [...changedStates]
  changedStates = _undefined
  for (let b of new Set(changedStatesArray.flatMap(filterBindings))) {
    let {_deps, dom} = b
    let newDom = b.func(...vals(_deps), dom, ...oldVals(_deps))
    if (newDom !== dom)
      if (newDom != _undefined)
        dom.replaceWith(b.dom = toDom(newDom)); else dom.remove(), b.dom = _undefined
  }
  for (let s of changedStatesArray) s.oldVal = s._val
}

let bindingGcCycleInMs = 1000
let statesToGc

let bind = (...deps) => {
  let func = deps.pop(), result = func(...vals(deps))
  if (result != _undefined) {
    let binding = {_deps: deps, dom: toDom(result), func}
    for (let s of deps) if (isState(s)) {
      statesToGc = addAndScheduleOnFirst(statesToGc, s,
        () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
        bindingGcCycleInMs)
      s.bindings.push(binding)
    }
    return binding.dom
  }
}

export default {add, tags: tagsNS(), "tagsNS": tagsNS, state, bind}
