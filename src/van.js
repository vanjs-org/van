// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, _undefined, protoOf = Obj.getPrototypeOf, doc = document

let addAndScheduleOnFirst = (set, s, func, waitMs) =>
  (set ?? (setTimeout(func, waitMs), new Set)).add(s)

let changedStates, curDeps

let runAndCaptureDeps = (f, deps, arg) => {
  let prevDeps = curDeps
  curDeps = deps
  let r = f(arg)
  curDeps = prevDeps
  return r
}

let stateProto = {
  get "val"() {
    curDeps?.add(this)
    return this._val
  },

  get "oldVal"() {
    curDeps?.add(this)
    return this._oldVal
  },

  set "val"(v) {
    // Aliasing `this` to reduce the bundle size.
    let s = this, curV = s._val
    if (v !== curV) {
      changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms)
      s._val = v
      let listeners = [...s.listeners = s.listeners.filter(l => !l.executed)]
      for (let l of listeners) effect(l.f), l.executed = 1
    }
  },
}

// stateProto is a plain object thus protoOf(stateProto) is just Object.prototype.
// protoOf(stateProto) is equivalent to protoOf({}) but saves 1 byte in the minized bundle.
let objProto = protoOf(stateProto), funcProto = protoOf(runAndCaptureDeps)

let state = initVal => ({
  __proto__: stateProto,
  _val: initVal,
  _oldVal: initVal,
  bindings: [],
  listeners: [],
})

let isState = s => protoOf(s ?? 0) === stateProto

let val = s => isState(s) ? s.val : s
let oldVal = s => isState(s) ? s.oldVal : s

let toDom = v => v == _undefined ? _undefined : v.nodeType ? v : new Text(v)

let bindingGcCycleInMs = 1000
let statesToGc

let filterBindings = s => s.bindings = s.bindings.filter(b => b.dom?.isConnected)

let bind = (f, dom) => {
  let deps = new Set, binding = {f, dom: toDom(runAndCaptureDeps(f, deps, dom))}
  for (let s of deps) {
    statesToGc = addAndScheduleOnFirst(statesToGc, s,
      () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
      bindingGcCycleInMs)
    s.bindings.push(binding)
  }
  return binding.dom
}

let effect = f => {
  let deps = new Set, listener = {f}
  runAndCaptureDeps(f, deps)
  for (let s of deps) s.listeners.push(listener)
}

let add = (dom, ...children) => {
  for (let c of children.flat(Infinity)) {
    let child = isState(c) ? bind(() => c.val) :
      protoOf(c ?? 0) === funcProto ? bind(c) : toDom(c)
    if (child != _undefined) dom.appendChild(child)
  }
  return dom
}

let propSetterCache = {}

let tagsNS = ns => new Proxy((name, ...args) => {
  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args]
  let dom = ns ? doc.createElementNS(ns, name) : doc.createElement(name)
  for (let [k, v] of Obj.entries(props)) {
    let getPropDescriptor = proto => proto ?
      Obj.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) :
      _undefined
    let cacheKey = name + "," + k
    let propSetter = propSetterCache[cacheKey] ??
      (propSetterCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0)
    let setter = propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k)
    if (isState(v)) bind(() => (setter(v.val), dom))
    else if (!k.startsWith("on") && protoOf(v ?? 0) === funcProto) bind(() => (setter(v()), dom))
    else setter(v)
  }
  return add(dom, ...children)
}, {get: (tag, name) => tag.bind(_undefined, name)})

let updateDoms = () => {
  let changedStatesArray = [...changedStates].filter(s => s._val !== s._oldVal)
  changedStates = _undefined
  for (let b of new Set(changedStatesArray.flatMap(filterBindings))) {
    let dom = b.dom, newDom = bind(b.f, dom)
    b.dom = _undefined
    if (newDom !== dom) newDom != _undefined ? dom.replaceWith(newDom) : dom.remove()
  }
  for (let s of changedStatesArray) s._oldVal = s._val
}

export default {add, tags: tagsNS(), "tagsNS": tagsNS, state, val, oldVal, effect}
