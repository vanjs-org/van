{
  // This file consistently uses `let` keyword instead of `const` for reducing the bundle size.
  // Global variables - aliasing some builtin symbols to reduce the bundle size.
  let {fromEntries, entries, keys, hasOwn, getPrototypeOf} = Object
  let {get: refGet, set: refSet, deleteProperty: refDelete, ownKeys: refOwnKeys} = Reflect
  let {state, derive, add} = van
  let statesToGc, gcCycleInMs = 1000, _undefined, replacing
  let statesSym = Symbol(), isCalcFunc = Symbol(), bindingsSym = Symbol(), keysGenSym = Symbol(), keyToChildSym = Symbol()
  let calc = f => (f[isCalcFunc] = 1, f)
  let isNonFuncObject = x => x instanceof Object && !(x instanceof Function)
  let toState = v => {
    if (v?.[isCalcFunc]) {
      let s = state()
      derive(() => {
        let newV = v()
        isNonFuncObject(s.rawVal) && isNonFuncObject(newV) ?
          replace(s.rawVal, newV) : s.val = reactive(newV)
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
  let reactive = srcObj => !(isNonFuncObject(srcObj)) || srcObj[statesSym] ? srcObj :
    new Proxy(buildStates(srcObj), {
      get: (states, name, proxy) =>
        name === statesSym ? states :
        hasOwn(states, name) ?
          Array.isArray(states) && name === "length" ?
            (states[keysGenSym].val, states.length) :
            states[name].val :
          refGet(states, name, proxy),
      set: (states, name, v, proxy) =>
        hasOwn(states, name) ?
          Array.isArray(states) && name === "length" && v !== states.length ?
            (states.length = v, ++states[keysGenSym].val) :
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
    })
  let stateFields = obj => obj[statesSym]
  let raw = obj => obj[statesSym] ?
    new Proxy(obj[statesSym], {get: (obj, name) => raw(obj[name].rawVal)}) : obj
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
  let onDelete = (states, k) => {
    for (let b of filterBindings(states)) {
      let keyToChild = b._containerDom[keyToChildSym]
      keyToChild[k]?.remove()
      delete keyToChild[k]
    }
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
  let replaceInternal = (obj, replacement) => {
    for (let [k, v] of entries(replacement)) {
      let existingV = obj[k]
      isNonFuncObject(existingV) && isNonFuncObject(v) ? replaceInternal(existingV, v) : obj[k] = v
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
    isNonFuncObject(obj) ? fromEntries(entries(obj).map(([k, v]) => [k, compact(v)])) : obj
  window.vanX = {calc, reactive, stateFields, raw, list, replace, compact}
}