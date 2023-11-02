{
  // This file consistently uses `let` keyword instead of `const` for reducing the bundle size.
  // Global variables - aliasing some builtin symbols to reduce the bundle size.
  let {fromEntries, entries, keys, getPrototypeOf} = Object
  let {get: refGet, set: refSet, deleteProperty: refDelete, ownKeys: refOwnKeys} = Reflect
  let Sym = Symbol, {state, derive, add, tags} = van, stateProto = getPrototypeOf(state())
  let itemsToGc, gcCycleInMs = 1000, _undefined
  let statesSym = Sym(), objSym = Sym(), isCalcFunc = Sym(), bindingsSym = Sym(), keysGenSym = Sym()
  let keySym = Sym()
  let calc = f => (f[isCalcFunc] = 1, f)
  let toState = v => v?.[isCalcFunc] ? derive(() => reactive(v())) : state(reactive(v))
  let reactive = srcObj => {
    if (!(srcObj instanceof Object) || srcObj[statesSym]) return srcObj
    let proxy = new Proxy(
      (srcObj[statesSym] = fromEntries(entries(srcObj).map(([k, v]) => [k, toState(v)])),
      srcObj[objSym] = srcObj,
      srcObj[bindingsSym] = [],
      srcObj[keysGenSym] = state(1),
      srcObj),
      {
        get: (obj, name) =>
          getPrototypeOf(obj[statesSym][name] ?? 0) === stateProto ? obj[statesSym][name].val : (
            name === "length" && obj[keysGenSym].val,
            refGet(obj, name, proxy)
          ),
        set(obj, name, v) {
          let states = obj[statesSym]
          if (name in states) return states[name].val = reactive(v), 1
          let existingKey = name in obj
          if (!refSet(obj, name, v)) return
          existingKey ||
            refSet(states, name, toState(v)) &&
            (++obj[keysGenSym].val, onAdd(proxy, name, states[name]))
          return 1
        },
        deleteProperty: (obj, name) => (
          refDelete(obj[statesSym], name) && onDelete(obj, name),
          refDelete(obj, name) && ++obj[keysGenSym].val
        ),
        ownKeys: obj => (obj[keysGenSym].val, refOwnKeys(obj)),
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
  let addToContainer = (items, k, v, {_containerDom, f}, skipReorder) => {
    add(_containerDom, toBindFunc(items, k, v, f))
    if (!skipReorder && Array.isArray(items) && k != items.length - 1) {
      let doms = {}
      for (let dom of _containerDom.childNodes) doms[dom[keySym]] = dom
      let dom = _containerDom.firstChild
      for (let key of keys(items))
        dom === doms[key] ? dom = dom.nextSibling : _containerDom.insertBefore(doms[key], dom)
    }
  }
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
    for (let [k, v] of entries(items[statesSym])) addToContainer(items, k, v, binding, 1)
    return binding._containerDom
  }
  let replace = (items, f) => {
    let newKvs = Array.isArray(items) ?
      entries(f(items.filter(_ => 1))) : f(entries(items))
    let obj = items[objSym], newObj = fromEntries(newKvs)
    let states = items[statesSym]
    let newStates = fromEntries(newKvs.map(([k, v]) => {
      let s = states[k]
      s ? s.val = reactive(v) : s = toState(v)
      return [k, s]
    }))
    for (let {_containerDom, f} of filterBindings(items)) {
      let doms = {}
      for (let dom of [..._containerDom.childNodes])
        dom[keySym] in newStates ? doms[dom[keySym]] = dom : dom.remove()
      let dom = _containerDom.firstChild
      for (let [k, s] of entries(newStates))
        dom === doms[k] ? dom = dom.nextSibling :
          _containerDom.insertBefore(doms[k] ??
            tags.div(toBindFunc(items, k, s, f)).firstChild, dom)
    }
    for (let k in obj) delete obj[k]
    for (let k in newObj) obj[k] = newObj[k]
    items[statesSym] = newStates
    ++items[keysGenSym].val
  }
  window.vanX = {calc, reactive, stateFields, list, replace}
}