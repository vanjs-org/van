// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let protoOf = Object.getPrototypeOf
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
  statesToGc = null
}, gcCycleInMs)

let stateProto = {
  get val() {
    curDeps?._getters?.add(this)
    return this._val
  },

  get oldVal() {
    curDeps?._getters?.add(this)
    return this._oldVal
  },

  set val(v) {
    curDeps?._setters?.add(this)
    if (v !== this._val) {
      this._val = v
      let listeners = [...this._listeners = keepConnected(this._listeners)]
      for (let l of listeners) derive(l.f, l.s, l._dom), l._dom = null
      this._bindings.length ?
        changedStates = addAndScheduleOnFirst(changedStates, this, updateDoms) :
        this._oldVal = v
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

let bind = (f, dom) => {
  let deps = {_getters: new Set, _setters: new Set}, binding = {f}, prevNewDerives = curNewDerives
  curNewDerives = []
  let newDom = runAndCaptureDeps(f, deps, dom)
  newDom = (newDom ?? document).nodeType ? newDom : new Text(newDom)
  for (let d of deps._getters)
    deps._setters.has(d) || (addStatesToGc(d), d._bindings.push(binding))
  for (let l of curNewDerives) l._dom = newDom
  curNewDerives = prevNewDerives
  return binding._dom = newDom
}

let derive = (f, s = state(), dom) => {
  let deps = {_getters: new Set, _setters: new Set}, listener = {f, s}
  listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom
  s.val = runAndCaptureDeps(f, deps, s._val)
  for (let d of deps._getters)
    deps._setters.has(d) || (addStatesToGc(d), d._listeners.push(listener))
  return s
}

let add = (dom, ...children) => {
  for (let c of children.flat(Infinity)) {
    let protoOfC = protoOf(c ?? 0)
    let child = protoOfC === stateProto ? bind(() => c.val) :
      protoOfC === funcProto ? bind(c) : c
    child != null && dom.append(child)
  }
  return dom
}

let tag = (ns, name, ...args) => {
  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args]
  let dom = ns ? document.createElementNS(ns, name) : document.createElement(name)
  for (let [k, v] of Object.entries(props)) {
    let getPropDescriptor = proto => proto ?
      Object.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) :
      null
    let cacheKey = name + "," + k
    let propSetter = propSetterCache[cacheKey] ??
      (propSetterCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0)
    let setter = k.startsWith("on") ?
      (v, oldV) => {
        let event = k.slice(2)
        dom.removeEventListener(event, oldV)
        dom.addEventListener(event, v)
      } :
      propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k)
    let protoOfV = protoOf(v ?? 0)
    k.startsWith("on") || protoOfV === funcProto && (v = derive(v), protoOfV = stateProto)
    protoOfV === stateProto ? bind(() => (setter(v.val, v._oldVal), dom)) : setter(v)
  }
  return add(dom, ...children)
}

let handler = ns => ({get: (_, name) => tag.bind(null, ns, name)})
let tags = new Proxy(ns => new Proxy(tag, handler(ns)), handler())

let update = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove()

let updateDoms = () => {
  let changedStatesArray = [...changedStates].filter(s => s._val !== s._oldVal)
  changedStates = null
  for (let b of new Set(changedStatesArray.flatMap(s => s._bindings = keepConnected(s._bindings))))
    update(b._dom, bind(b.f, b._dom)), b._dom = null
  for (let s of changedStatesArray) s._oldVal = s._val
}

let hydrate = (dom, f) => update(dom, bind(f, dom))

export default {add, tags, state, derive, hydrate}
