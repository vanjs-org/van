import van from "vanjs-core"

// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, {get: refGet, set: refSet, deleteProperty: refDelete} = Reflect, Sym = Symbol, {state, derive, add, tags} = van, itemsToGc, gcCycleInMs = 1000, _undefined
let statesSym = Sym(), objSym = Sym(), isCalcFunc = Sym(), bindingsSym = Sym(), keySym = Sym()

let calc = f => (f[isCalcFunc] = 1, f)

let toState = v => v[isCalcFunc] ? derive(() => reactive(v())) : state(reactive(v))

let reactive = srcObj => {
  if (!(srcObj instanceof Obj) || srcObj[statesSym]) return srcObj
  let proxy = new Proxy(
    (srcObj[statesSym] = Obj.fromEntries(Obj.entries(srcObj).map(([k, v]) => [k, toState(v)])),
    srcObj[objSym] = srcObj,
    srcObj[bindingsSym] = [],
    srcObj),
    {
      get: (obj, name) => obj[statesSym][name]?.val ?? refGet(obj, name, proxy),
      set(obj, name, v) {
        let states = obj[statesSym]
        return name in states ? (states[name].val = reactive(v), 1) : (
          name in obj || refSet(states, name, toState(v)) && onAdd(obj, name, states[name]),
          refSet(obj, name, v)
        )
      },
      deleteProperty: (obj, name) => (
        refDelete(obj[statesSym], name) && onDelete(obj, name),
        refDelete(obj, name)
      ),
    },
  )
  return proxy
}

let stateFields = obj => obj[statesSym]

let filterBindings = items =>
  items[bindingsSym] = items[bindingsSym].filter(b => b._containerDom.isConnected)

let toBindFunc = (items, k, v, f) => () => {
  let dom = f(v, () => delete items[k])
  dom[keySym] = k
  return dom
}

let addToContainer = (items, k, v, binding) =>
  add(binding._containerDom, toBindFunc(items, k, v, binding.f))

let onAdd = (items, k, v) => filterBindings(items).forEach(
  addToContainer.bind(_undefined, items, k, v))

let onDelete = (items, k) => {
  for (let b of filterBindings(items))
    [...b._containerDom.childNodes].find(dom => dom[keySym] === k)?.remove()
}

let addItemsToGc = items => (itemsToGc ?? (itemsToGc = (
  setTimeout(
    () => (itemsToGc.forEach(filterBindings), itemsToGc = _undefined), gcCycleInMs),
  new Set))).add(items)

let list = (containerFunc, items, itemFunc) => {
  let binding = {_containerDom: containerFunc(), f: itemFunc}
  items[bindingsSym].push(binding)
  addItemsToGc(items)
  for (let [k, v] of Obj.entries(items[statesSym])) addToContainer(items, k, v, binding)
  return binding._containerDom
}

let replace = (items, f) => {
  let newKvs = Array.isArray(items) ?
    Obj.entries(f(items.filter(_ => 1))) : f(Obj.entries(items))
  let obj = items[objSym], newObj = Obj.fromEntries(newKvs)
  let states = items[statesSym]
  let newStates = Obj.fromEntries(newKvs.map(([k, v]) => {
    let s = states[k]
    s ? s.val = v : s = toState(v)
    return [k, s]
  }))

  for (let {_containerDom, f} of filterBindings(items)) {
    let doms = {}
    for (let dom of [..._containerDom.childNodes])
      dom[keySym] in newStates ? doms[dom[keySym]] = dom : dom.remove()
    let dom = _containerDom.firstChild
    for (let [k, s] of Obj.entries(newStates))
      dom === doms[k] ? dom = dom.nextSibling :
        _containerDom.insertBefore(doms[k] ??
          tags.div(toBindFunc(items, k, s, f)).firstChild, dom)
  }

  for (let k in obj) delete obj[k]
  for (let k in newObj) obj[k] = newObj[k]
  items[statesSym] = newStates
}

export {calc, reactive, stateFields, list, replace}
