import van from "vanjs-core"

// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, Ref = Reflect, {state, derive} = van
let statesSym = Symbol(), isCalcFunc = Symbol(), domsSym = Symbol()

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
          name in obj || Ref.set(states, name, state(reactive(v))),
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

    let oldObj = derived.oldVal, oldDoms = oldObj[domsSym]
    for (let k in oldObj) k in obj || delete oldObj[k]

    return dom
  }
}

export {calc, reactive, stateFields}
