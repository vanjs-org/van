{
  // This file consistently uses `let` keyword instead of `const` for reducing the bundle size.
  // Global variables - aliasing some builtin symbols to reduce the bundle size.
  let {fromEntries, entries, keys} = Object
  let {get: refGet, set: refSet, deleteProperty: refDelete, ownKeys: refOwnKeys} = Reflect
  let {state, derive, add} = van
  let itemsToGc, gcCycleInMs = 1000, _undefined, replacing
  let objSym = Symbol(), statesSym = Symbol(), isCalcFunc = Symbol(), bindingsSym = Symbol()
  let keysGenSym = Symbol(), keyToChildSym = Symbol()
  let calc = f => (f[isCalcFunc] = 1, f)
  let toState = v => {
    if (v?.[isCalcFunc]) {
      let s = state()
      derive(() => {
        let newV = v()
        s.rawVal instanceof Object && newV instanceof Object ?
          replace(s.rawVal, newV) : s.val = reactive(newV)
      })
      return s
    } else return state(reactive(v))
  }
  let reactive = srcObj => !(srcObj instanceof Object) || srcObj[statesSym] ? srcObj :
    new Proxy(
      (srcObj[objSym] = srcObj,
      srcObj[statesSym] = fromEntries(entries(srcObj).map(([k, v]) => [k, toState(v)])),
      srcObj[bindingsSym] = [],
      srcObj[keysGenSym] = state(1),
      srcObj),
      {
        get: (obj, name, proxy) => obj[statesSym].hasOwnProperty(name) ? obj[statesSym][name].val : (
          name === "length" && obj[keysGenSym].val,
          refGet(obj, name, proxy)
        ),
        set(obj, name, v, proxy) {
          let states = obj[statesSym]
          if (states.hasOwnProperty(name)) return states[name].val = reactive(v), 1
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
    addToContainer.bind(_undefined, items, k, v, replacing))
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
  let list = (container, items, itemFunc) => {
    let binding = {_containerDom: container instanceof Function ? container() : container, f: itemFunc}
    binding._containerDom[keyToChildSym] = {}
    items[bindingsSym].push(binding)
    addItemsToGc(items)
    for (let [k, v] of entries(items[statesSym])) addToContainer(items, k, v, 1, binding)
    return binding._containerDom
  }
  let replaceInternal = (target, source) => {
    for (let [k, v] of entries(source)) {
      let existingV = target[k]
      existingV instanceof Object && v instanceof Object ? replaceInternal(existingV, v) : target[k] = v
    }
    for (let k in target) source.hasOwnProperty(k) || delete target[k]
    let sourceKeys = keys(source), isArray = Array.isArray(target)
    if (isArray || keys(target).some((k, i) => k !== sourceKeys[i])) {
      if (isArray) target.length = source.length; else {
        ++target[keysGenSym].val
        let obj = target[objSym], objCopy = {...obj}
        for (let k of sourceKeys) delete obj[k]
        for (let k of sourceKeys) obj[k] = objCopy[k]
      }
      for (let {_containerDom} of filterBindings(target)) {
        let {firstChild: dom, [keyToChildSym]: keyToChild} = _containerDom
        for (let k of sourceKeys) dom === keyToChild[k] ?
          dom = dom.nextSibling : _containerDom.insertBefore(keyToChild[k], dom)
      }
    }
    return target
  }
  let replace = (target, source) => {
    if (source instanceof Function)
      source = Array.isArray(target) ? source(target.filter(_ => 1)) : fromEntries(source(entries(target)))
    replacing = 1
    try {
      return replaceInternal(target, source)
    } finally {
      replacing = _undefined
    }
  }
  let compact = obj => Array.isArray(obj) ? obj.filter(_ => 1).map(compact) :
    obj instanceof Object ? fromEntries(entries(obj).map(([k, v]) => [k, compact(v)])) : obj
  window.vanX = {calc, reactive, stateFields, raw, list, replace, compact}
}