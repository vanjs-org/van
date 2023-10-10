import van from "vanjs-core"

// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Global variables - aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, protoOf = Obj.getPrototypeOf, objProto = protoOf({}), funcProto = protoOf(protoOf)

let toState = v => {
  let protoOfV = protoOf(v)
  protoOfV === funcProto ? van.derive(v) : van.state(protoOfV === objProto ? reactive(v) : v)
}

export let statesSym = Symbol()

export let reactive = srcObj => new Proxy(
  Obj.fromEntries(Obj.entries(srcObj).map(([k, v]) => [k, toState(v)])),
  {
    get: (obj, name) => name === statesSym ? obj : obj[name].val,
    set: (obj, name, val) => obj[name].val = val,
  }
)
