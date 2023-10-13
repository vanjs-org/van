import van from "vanjs-core"

// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, {get: refGet, set: refSet, deleteProperty: refDelete} = Reflect, Sym = Symbol, {state, derive} = van
let statesSym = Sym(), isCalcFunc = Sym(), domsSym = Sym()

let calc = f => (f[isCalcFunc] = 1, f)

let toState = v => v[isCalcFunc] ? derive(() => reactive(v())) : state(reactive(v))

let reactive = srcObj => {
  if (!(srcObj instanceof Obj)) return srcObj
  let proxy = new Proxy(
    (srcObj[statesSym] = new Proxy(
      Obj.fromEntries(Obj.entries(srcObj).map(([k, v]) => [k, toState(v)])),
      { deleteProperty: (states, name) => refDelete(states, name) && refDelete(srcObj, name) }
    ), srcObj),
    {
      get: (obj, name) => obj[statesSym][name]?.val ?? refGet(obj, name, proxy),
      set: (obj, name, v) => {
        let states = obj[statesSym]
        return name in states ? (states[name].val = reactive(v), 1) : (
          name in obj || refSet(states, name, toState(v)),
          refSet(obj, name, v)
        )
      }
    },
  )
  return proxy
}

let stateFields = obj => obj[statesSym]

let withDeleteHandler = srcObj => new Proxy(srcObj,
  {
    deleteProperty: (obj, name) => refDelete(obj, name) && (obj[domsSym][name].remove(), 1)
  },
)

let list = (containerFunc, items, itemFunc) => {
  let derived = derive(() => withDeleteHandler(items.val[statesSym] ?? items.val))
  return dom => {
    let obj = derived.val
    if (!dom) {
      let doms = obj[domsSym] = {}
      return containerFunc(Obj.entries(obj).map(
        ([k, v]) => doms[k] = itemFunc(v, () => delete derived.val[k])))
    }
    let oldObj = derived.oldVal
    if (obj === oldObj) return dom

    let itemDoms = obj[domsSym] = oldObj[domsSym], insertedKeys = new Set
    for (let k in oldObj) k in obj || (delete oldObj[k], delete itemDoms[k])

    let oldKeys = Obj.keys(oldObj), oldKeyIndex = 0, changedItems = []
    for (let [k, v] of Obj.entries(obj)) {
      let curOldKey = oldKeys[oldKeyIndex]
      if (k in oldObj) {
        let itemState = obj[k] = oldObj[k]
        itemState.val !== v.val && changedItems.push([itemState, v.val])
        if (k === curOldKey)
          while (insertedKeys.has(oldKeys[++oldKeyIndex]));
        else {
          dom.insertBefore(itemDoms[k], itemDoms[curOldKey])
          insertedKeys.add(k)
        }
      } else
        dom.insertBefore(itemDoms[k] = itemFunc(v, () => delete derived.val[k]),
          itemDoms[curOldKey])
    }
    setTimeout(() => { for (let [k, v] of changedItems) k.val = v })

    return dom
  }
}

export {calc, reactive, stateFields, list}
