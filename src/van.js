// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, _undefined, protoOf = Obj.getPrototypeOf, doc = document
let changedStates, curDeps, curNewDerives, alwaysConnectedDom = {isConnected: 1}, gcCycleInMs = 1000, statesToGc, propSetterCache = {}
let objProto = protoOf(alwaysConnectedDom), funcProto = protoOf(protoOf)

let addAndScheduleOnFirst = (set, s, f, waitMs) =>
  (set ?? (setTimeout(f, waitMs), new Set)).add(s)

let runAndCaptureDeps = (f, deps, arg) => {
  let prevDeps = curDeps
  curDeps = deps
  try {
    return f(arg)
  } catch (e) {
    console.error(e)
    return arg
  } finally {
    curDeps = prevDeps
  }
}

let keepConnected = l => l.filter(b => b._dom?.isConnected)

let addStatesToGc = d => statesToGc = addAndScheduleOnFirst(statesToGc, d, () => {
  for (let s of statesToGc)
    s._bindings = keepConnected(s._bindings),
    s._listeners = keepConnected(s._listeners)
  statesToGc = _undefined
}, gcCycleInMs)

let stateProto = {
  get val() {
    curDeps?.add(this)
    return this._val
  },

  get oldVal() {
    curDeps?.add(this)
    return this._oldVal
  },

  set val(v) {
    // Aliasing `this` to reduce the bundle size.
    let s = this
    if (v !== s._val) {
      s._val = v
      let listeners = [...s._listeners = keepConnected(s._listeners)]
      for (let l of listeners) derive(l.f, l.s, l._dom), l._dom = _undefined
      s._bindings.length ?
        changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms) :
        s._oldVal = v
    }
  },
}

let state = initVal => ({
  __proto__: stateProto,
  _val: initVal,
  _oldVal: initVal,
  _bindings: [],
  _listeners: [],
})

let isState = s => protoOf(s ?? 0) === stateProto

let val = s => isState(s) ? s.val : s
let oldVal = s => isState(s) ? s.oldVal : s

let bind = (f, dom) => {
  let deps = new Set, binding = {f}, prevNewDerives = curNewDerives
  curNewDerives = []
  let newDom = runAndCaptureDeps(f, deps, dom)
  newDom = (newDom ?? doc).nodeType ? newDom : new Text(newDom)
  for (let d of deps) addStatesToGc(d), d._bindings.push(binding)
  for (let l of curNewDerives) l._dom = newDom
  curNewDerives = prevNewDerives
  return binding._dom = newDom
}

let derive = (f, s = state(), dom) => {
  let deps = new Set, listener = {f, s}
  listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom
  s.val = runAndCaptureDeps(f, deps)
  for (let d of deps) addStatesToGc(d), d._listeners.push(listener)
  return s
}

let add = (dom, ...children) => {
  for (let c of children.flat(Infinity)) {
    let protoOfC = protoOf(c ?? 0)
    let child = protoOfC === stateProto ? bind(() => c.val) :
      protoOfC === funcProto ? bind(c) : c
    if (child != _undefined) dom.append(child)
  }
  return dom
}

let _ = f => (f._isBindingFunc = 1, f)

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
    let protoOfV = protoOf(v ?? 0)
    if (protoOfV === stateProto) bind(() => (setter(v.val), dom))
    else if (protoOfV === funcProto && (!k.startsWith("on") || v._isBindingFunc))
      bind(() => (setter(v()), dom))
    else setter(v)
  }
  return add(dom, ...children)
}, {get: (tag, name) => tag.bind(_undefined, name)})

let update = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove()

let updateDoms = () => {
  let changedStatesArray = [...changedStates].filter(s => s._val !== s._oldVal)
  changedStates = _undefined
  for (let b of new Set(changedStatesArray.flatMap(s => s._bindings = keepConnected(s._bindings))))
    update(b._dom, bind(b.f, b._dom)), b._dom = _undefined
  for (let s of changedStatesArray) s._oldVal = s._val
}

let hydrate = (dom, f) => update(dom, bind(f, dom))

export default {add, _, tags: tagsNS(), tagsNS, state, val, oldVal, derive, hydrate}
