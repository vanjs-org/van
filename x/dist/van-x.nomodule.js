{
  window.vanX = {}
  // This file consistently uses `let` keyword instead of `const` for reducing the bundle size.
  // Global variables - aliasing some builtin symbols to reduce the bundle size.
  let Obj = Object, Ref = Reflect, Sym = Symbol, {state, derive} = van
  let statesSym = Sym(), isCalcFunc = Sym(), domsSym = Sym()
  let calc = f => (f[isCalcFunc] = 1, f)
  let toState = v => v[isCalcFunc] ? derive(() => reactive(v())) : state(reactive(v))
  let reactive = srcObj => {
    if (!(srcObj instanceof Obj)) return srcObj
    let proxy = new Proxy(
      (srcObj[statesSym] = Obj.fromEntries(Obj.entries(srcObj).map(([k, v]) => [k, toState(v)])),
      srcObj),
      {
        get: (obj, name) => obj[statesSym][name]?.val ?? Ref.get(obj, name, proxy),
        set: (obj, name, v) => {
          let states = obj[statesSym]
          return name in states ? (states[name].val = reactive(v), 1) : (
            name in obj || Ref.set(states, name, toState(v)),
            Ref.set(obj, name, v)
          )
        }
      },
    )
    return proxy
  }
  let stateFields = obj => obj[statesSym]
  let withDeleteHandler = srcObj => new Proxy(srcObj,
    {
      deleteProperty: (obj, name) =>
        Ref.deleteProperty(obj, name) && (obj[domsSym][name].remove(), 1)
    },
  )
  let keyedItems = (containerFunc, s, itemFunc) => {
    let derived = derive(() => withDeleteHandler(s.val[statesSym] ?? s.val))
    return dom => {
      let obj = derived.val
      if (!dom) {
        let doms = obj[domsSym] = {}
        return containerFunc(Obj.entries(obj).map(
          ([k, v]) => doms[k] = itemFunc(v, () => delete obj[k])))
      }
      if (s.val === s.oldVal) return dom
      let oldObj = derived.oldVal, oldDoms = oldObj[domsSym], insertedKeys = new Set, doms = obj[domsSym] = {}
      for (let k in oldObj) k in obj || delete oldObj[k]
      let oldKeys = Obj.keys(oldObj), oldKeyIndex = 0
      for (let [k, v] of Obj.entries(obj))
        if (k in oldKeys) {
          oldObj[k].val = v.val
          if (k === oldKeys[oldKeyIndex])
            do {} while (insertedKeys.has(oldKeys[++oldKeyIndex]))
          else {
            dom.insertBefore(oldDoms, oldDoms[oldKeys[oldKeyIndex]])
            insertedKeys.add(k)
          }
        } else {
        }
      return dom
    }
  }
  window.vanX = {calc, reactive, stateFields}
}