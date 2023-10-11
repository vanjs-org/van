import van from "vanjs-core"

// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, protoOf = Obj.getPrototypeOf, funcProto = protoOf(protoOf), {state, derive, val} = van
let statesSym = Symbol(), domsSym = Symbol()

let toReactiveObj = v => v instanceof Obj ? reactive(v) : v

let toState = v => protoOf(v ?? 0) === funcProto ?
  derive(() => toReactiveObj(v())) : state(toReactiveObj(v))

let reactive = srcObj => new Proxy(
  Obj.fromEntries(Obj.entries(srcObj).map(([k, v]) => [k, toState(v)])),
  {
    get: (obj, name) => name === statesSym ? obj : val(obj[name]),
    set: (obj, name, v) => name in obj ?
      (obj[name].val = toReactiveObj(v), 1) : Reflect.set(obj, name, state(toReactiveObj(v)))
  },
)

let stateFields = obj => obj[statesSym]

let withDeleteHandler = srcObj => new Proxy(srcObj,
  {
    deleteProperty: (obj, name) =>
      Reflect.deleteProperty(obj, name) && (obj[domsSym][name].remove(), 1)
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

export {reactive, stateFields}
