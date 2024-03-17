import van from "vanjs-core"

// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let {fromEntries, entries, keys, getPrototypeOf} = Object
let {get: refGet, set: refSet, deleteProperty: refDelete, ownKeys: refOwnKeys} = Reflect
let {state, derive, add} = van, stateProto = getPrototypeOf(state())
let itemsToGc, gcCycleInMs = 1000, _undefined, updating
let statesSym = Symbol(), isCalcFunc = Symbol(), bindingsSym = Symbol()
let keysGenSym = Symbol(), keyToChildSym = Symbol()

let calc = f => (f[isCalcFunc] = 1, f)

let toState = v => {
  if (v?.[isCalcFunc]) {
    let s = state()
    derive(() => {
      newV = v()
      s.rawVal instanceof Object && newV instanceof Object ?
        updateInternal(s.rawVal, newV) : s.val = newV
    })
    return s
  } else return state(reactive(v))
}

let reactive = srcObj => !(srcObj instanceof Object) || srcObj[statesSym] ? srcObj :
  new Proxy(
    (srcObj[statesSym] = fromEntries(entries(srcObj).map(([k, v]) => [k, toState(v)])),
    srcObj[bindingsSym] = [],
    srcObj[keysGenSym] = state(1),
    srcObj),
    {
      get: (obj, name) =>
        getPrototypeOf(obj[statesSym][name] ?? 0) === stateProto ? obj[statesSym][name].val : (
          name === "length" && obj[keysGenSym].val,
          refGet(obj, name, proxy)
        ),
      set(obj, name, v, proxy) {
        let states = obj[statesSym]
        if (name in states) return states[name].val = reactive(v), 1
        let existingKey = name in obj
        let setNewLength = existingKey && name === "length" && v !== obj.length
        if (!refSet(obj, name, v)) return
        existingKey ?
          setNewLength && ++obj[keysGenSym].val :
          refSet(states, name, toState(v)) && (++obj[keysGenSym].val, onAdd(proxy, name, states[name]))
        return 1
      },
      deleteProperty: (obj, name) => (
        refDelete(obj[statesSym], name) && onDelete(obj, name),
        refDelete(obj, name) && ++obj[keysGenSym].val
      ),
      ownKeys: obj => (obj[keysGenSym].val, refOwnKeys(obj)),
    }
  )

let stateFields = obj => obj[statesSym]

let raw = obj => obj[statesSym] ?
  new Proxy(obj[statesSym], {get: (obj, name) => raw(obj[name].rawVal)}) : obj

let filterBindings = items =>
  items[bindingsSym] = items[bindingsSym].filter(b => b._containerDom.isConnected)

let addToContainer = (items, k, v, skipReorder, {_containerDom, f}) => {
  let isArray = Array.isArray(items)
  add(_containerDom, () =>
    _containerDom[keyToChildSym][k] = f(v, () => delete items[k], isArray ? Number(k) : k))
  if (isArray && !skipReorder && k != items.length - 1) {
    let kNumber = Number(k)
    _containerDom.insertBefore(_containerDom.lastChild,
      _containerDom[keyToChildSym][keys(items).find(key => Number(key) > kNumber)])
  }
}

let onAdd = (items, k, v) => filterBindings(items).forEach(
  addToContainer.bind(_undefined, items, k, v, updating))

let onDelete = (items, k) => {
  for (let b of filterBindings(items)) {
    let keyToChild = b._containerDom[keyToChildSym]
    keyToChild[k]?.remove()
    delete keyToChild[k]
  }
}

let addItemsToGc = items => (itemsToGc ?? (itemsToGc = (
  setTimeout(
    () => (itemsToGc.forEach(filterBindings), itemsToGc = _undefined), gcCycleInMs),
  new Set))).add(items)

let list = (containerFunc, items, itemFunc) => {
  let binding = {_containerDom: containerFunc(), f: itemFunc}
  items[bindingsSym].push(binding)
  addItemsToGc(items)
  for (let [k, v] of entries(items[statesSym])) addToContainer(items, k, v, 1, binding)
  return binding._containerDom
}

let updateInternal = (target, source) => {
  for (let [k, v] of entries(source)) {
    let existingV = target[k]
    existingV instanceof Object && v instanceof Object ? updateInternal(v, existingV) : target[k] = v
  }
  for (let k in target) k in source || delete target[k]
  let targetKeys = keys(target)
  if (Array.isArray(target) || keys(source).some((k, i) => k !== targetKeys[i])) {
    for (let {_containerDom} of filterBindings(target)) {
      let {firstChild: dom, [keyToChildSym]: keyToChild} = _containerDom
      for (let k of targetKeys) dom === keyToChild[k] ?
        dom = dom.nextSibling : _containerDom.insertBefore(keyToChild[k], dom)
    }
    ++target[keysGenSym]
  }
  return target
}

let replace = (items, f) => updateInternal(items,
  Array.isArray(items) ? f(items.filter(_ => 1)) : fromEntries(f(entries(items))))

let compact = obj => Array.isArray(obj) ? obj.filter(_ => 1).map(compact) :
  obj instanceof Object ? fromEntries(entries(obj).map(([k, v]) => [k, compact(v)])) : obj

let update = (target, source) => {
  updating = 1
  try {
    updateInternal(target, source)
  } finally {
    updating = _undefined
  }
}

export {calc, reactive, stateFields, raw, list, replace, compact, update}
