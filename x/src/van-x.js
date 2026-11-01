import van from "vanjs-core"

// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let {fromEntries, entries, keys, hasOwn, getPrototypeOf, create, assign} = Object
let {get: refGet, set: refSet, deleteProperty: refDelete, ownKeys: refOwnKeys} = Reflect
let {state, derive, add} = van
let statesToGc, gcCycleInMs = 1000, _undefined, replacing
let statesSym = Symbol(), isCalcFunc = Symbol(), bindingsSym = Symbol(), keysGenSym = Symbol(), keyToChildSym = Symbol(), noreactiveSym = Symbol()

let calc = f => (f[isCalcFunc] = 1, f)

let isObject = x => x instanceof Object && !(x instanceof Function) && !x[noreactiveSym]

let toState = v => {
  if (v?.[isCalcFunc]) {
    let s = state()
    derive(() => {
      let newV = v()
      isObject(s.rawVal) && isObject(newV) ? replace(s.rawVal, newV) : s.val = reactive(newV)
    })
    return s
  } else return state(reactive(v))
}

let buildStates = srcObj => {
  let states = Array.isArray(srcObj) ? [] : {__proto__: getPrototypeOf(srcObj)}
  for (let [k, v] of entries(srcObj)) states[k] = toState(v)
  states[bindingsSym] = []
  states[keysGenSym] = state(1)
  return states
}

let resize = (states, v) => {
  let oldLength = states.length
  // Let the array convert and validate the length before changing any bindings.
  states.length = v
  let length = states.length
  if (length < oldLength) for (let {_containerDom} of filterBindings(states)) {
    let rows = _containerDom[keyToChildSym]
    for (let i = length; i < oldLength; ++i) removeRow(rows, i)
  }
  length !== oldLength && ++states[keysGenSym].val
  return 1
}

let reactiveHandler = {
  get: (states, name, proxy) =>
    name === statesSym ? states :
    hasOwn(states, name) ?
      Array.isArray(states) && name === "length" ?
        (states[keysGenSym].val, states.length) :
        states[name].val :
      refGet(states, name, proxy),
  set: (states, name, v, proxy) =>
    hasOwn(states, name) ?
      Array.isArray(states) && name === "length" ?
        resize(states, v) :
        (states[name].val = reactive(v), 1) :
    name in states ? refSet(states, name, v, proxy) :
      refSet(states, name, toState(v)) && (
        ++states[keysGenSym].val,
        filterBindings(states).forEach(
          addToContainer.bind(_undefined, proxy, name, states[name], replacing)),
        1
      ),
  deleteProperty: (states, name) =>
    (refDelete(states, name) && onDelete(states, name), ++states[keysGenSym].val),
  ownKeys: states => (states[keysGenSym].val, refOwnKeys(states)),
}

let reactive = srcObj => !isObject(srcObj) || srcObj[statesSym] ? srcObj :
  new Proxy(buildStates(srcObj), reactiveHandler)

let noreactive = x => (x[noreactiveSym] = 1, x)

let stateFields = obj => obj[statesSym]

let stateProto = getPrototypeOf(state())

let rawStates = states => new Proxy(states, {
  get: (states, name, proxy) => getPrototypeOf(states[name] ?? 0) === stateProto ?
    {val: raw(states[name].rawVal)} : refGet(states, name, proxy),
})

let raw = obj => obj?.[statesSym] ? new Proxy(rawStates(obj[statesSym]), reactiveHandler) : obj

let filterBindings = states =>
  states[bindingsSym] = states[bindingsSym].filter(b => b._containerDom.isConnected)

let addToContainer = (items, k, v, skipReorder, {_containerDom, f}) => {
  let isArray = Array.isArray(items), typedK = isArray ? Number(k) : k
  add(_containerDom, () =>
    _containerDom[keyToChildSym][k] = f(v, () => delete items[k], typedK))
  isArray && !skipReorder && typedK !== items.length - 1 &&
    _containerDom.insertBefore(_containerDom.lastChild,
      _containerDom[keyToChildSym][keys(items).find(key => Number(key) > typedK)])
}

let removeRow = (rows, k) => {
  rows[k]?.remove()
  delete rows[k]
}

let onDelete = (states, k) => {
  for (let {_containerDom} of filterBindings(states)) removeRow(_containerDom[keyToChildSym], k)
}

let addStatesToGc = states => (statesToGc ?? (statesToGc = (
  setTimeout(
    () => (statesToGc.forEach(filterBindings), statesToGc = _undefined), gcCycleInMs),
  new Set))).add(states)

let list = (container, items, itemFunc) => {
  let binding = {_containerDom: container instanceof Function ? container() : container, f: itemFunc}
  let states = items[statesSym]
  binding._containerDom[keyToChildSym] = {}
  states[bindingsSym].push(binding)
  addStatesToGc(states)
  for (let [k, v] of entries(states)) addToContainer(items, k, v, 1, binding)
  return binding._containerDom
}

let objectsIn = (v, old, seen = new Map) => {
  if (isObject(v) && !seen.has(v)) {
    seen.set(v, old?.has(v))
    let states = v[statesSym]
    for (let k of keys(states ?? v))
      objectsIn(states ? states[k].rawVal : v[k], old, seen)
  }
  return seen
}

let replaceInternal = (obj, replacement, retained = objectsIn(replacement, objectsIn(obj))) => {
  for (let [k, v] of entries(replacement)) {
    let existingV = obj[k]
    if (isObject(existingV) && existingV === v) continue
    if (isObject(existingV) && isObject(v) && !retained.get(existingV) && !retained.get(v))
      replaceInternal(existingV, v, retained)
    else obj[k] = v
  }
  for (let k in obj) hasOwn(replacement, k) || delete obj[k]
  let newKeys = keys(replacement), isArray = Array.isArray(obj)
  if (isArray || keys(obj).some((k, i) => k !== newKeys[i])) {
    let states = obj[statesSym]
    if (isArray) obj.length = replacement.length; else {
      ++states[keysGenSym].val
      let statesCopy = {...states}
      for (let k of newKeys) delete states[k]
      for (let k of newKeys) states[k] = statesCopy[k]
    }
    for (let {_containerDom} of filterBindings(states)) {
      let {firstChild: dom, [keyToChildSym]: keyToChild} = _containerDom
      for (let k of newKeys) dom === keyToChild[k] ?
        dom = dom.nextSibling : _containerDom.insertBefore(keyToChild[k], dom)
    }
  }
  return obj
}

let replace = (obj, replacement) => {
  replacing = 1
  try {
    return replaceInternal(obj, replacement instanceof Function ?
      Array.isArray(obj) ? replacement(obj.filter(_ => 1)) : fromEntries(replacement(entries(obj))) :
      replacement
    )
  } finally {
    replacing = _undefined
  }
}

let compact = obj => Array.isArray(obj) ? obj.filter(_ => 1).map(compact) :
  isObject(obj) ?
    assign(create(getPrototypeOf(obj)), fromEntries(entries(obj).map(([k, v]) => [k, compact(v)])))
    : obj

export {calc, reactive, noreactive, stateFields, raw, list, replace, compact}
