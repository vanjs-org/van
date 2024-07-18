// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let Objct = Object, SetConstructor = Set, protoOf = Objct.getPrototypeOf
let changedStates, derivedStates, curDeps, curNewDerives, alwaysConnectedDom = {isConnected: 1}
let gcCycleInMs = 1000, statesToGc, propSetterCache = {}
let objProto = protoOf(alwaysConnectedDom), funcProto = protoOf(protoOf), _undefined

let addAndScheduleOnFirst = (set, s, f, waitMs) =>
  (set ?? (setTimeout(f, waitMs), new SetConstructor)).add(s);

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

let connectedB = (s) => s._bindings = keepConnected(s._bindings)
let connectedL = (s) => s._listeners = keepConnected(s._listeners)

let addStatesToGc = d => statesToGc = addAndScheduleOnFirst(statesToGc, d, () => {
  for (let s of statesToGc)
    connectedB(s), connectedL(s);
  statesToGc = _undefined
}, gcCycleInMs)

let stateProto = {
  get val() {
    curDeps?._getters?.add(this)
    return this.rawVal
  },

  get oldVal() {
    curDeps?._getters?.add(this)
    return this._oldVal
  },

  set val(v) {
    let t = this
    curDeps?._setters?.add(t)
    if (v !== t.rawVal) {
      t.rawVal = v
      t._bindings.length + t._listeners.length ?
        (derivedStates?.add(t), changedStates = addAndScheduleOnFirst(changedStates, t, updateDoms)) :
        t._oldVal = v
    }
  },
}

let state = initVal => ({
  __proto__: stateProto,
  rawVal: initVal,
  _oldVal: initVal,
  _bindings: [],
  _listeners: [],
})

let bind = (f, dom) => {
  let deps = {_getters: new SetConstructor(), _setters: new SetConstructor()}, binding = {f}, prevNewDerives = curNewDerives
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
  let deps = {_getters: new SetConstructor(), _setters: new SetConstructor()}, listener = {f, s}
  listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom
  s.val = runAndCaptureDeps(f, deps, s.rawVal)
  for (let d of deps._getters)
    deps._setters.has(d) || (addStatesToGc(d), d._listeners.push(listener))
  return s
}

let add = (dom, ...children) => {
  for (let c of children.flat(Infinity)) {
    let protoOfC = protoOf(c ?? 0)
    let child = protoOfC === stateProto ? bind(() => c.val) :
      protoOfC === funcProto ? bind(c) : c
    child != _undefined && dom.append(child)
  }
  return dom
}

let tag = (ns, name, ...args) => {
  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args]
  let dom = ns ? document.createElementNS(ns, name) : document.createElement(name)
  for (let [k, v] of Objct.entries(props)) {
    let getPropDescriptor = (proto) => proto ?
      Objct.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) :
      _undefined
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
  return add(dom, children)
}

let handler = ns => ({get: (_, name) => tag.bind(_undefined, ns, name)})

let update = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove()

let filtered = () => [...changedStates].filter(
  (s) => s.rawVal !== s._oldVal,
)

let updateDoms = () => {
  let iter = 0, derivedStatesArray = filtered()
  do {
    derivedStates = new SetConstructor()
    for (let l of new SetConstructor(derivedStatesArray.flatMap(connectedL)))
      derive(l.f, l.s, l._dom), l._dom = _undefined
  } while (++iter < 100 && (derivedStatesArray = [...derivedStates]).length)
  let changedStatesArray = filtered()
  changedStates = _undefined
  for (let b of new SetConstructor(changedStatesArray.flatMap(connectedB)))
    update(b._dom, bind(b.f, b._dom)), b._dom = _undefined
  for (let s of changedStatesArray) s._oldVal = s.rawVal
}

export default {
  add,
  tags: new Proxy((ns) => new Proxy(tag, handler(ns)), handler()),
  state,
  derive,
  hydrate: (dom, f) => update(dom, bind(f, dom)),
};
