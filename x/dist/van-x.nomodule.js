{
  window.vanX = {}
  // This file consistently uses `let` keyword instead of `const` for reducing the bundle size.
  // Global variables - aliasing some builtin symbols to reduce the bundle size.
  let Obj = Object, protoOf = Obj.getPrototypeOf, objProto = protoOf({}), funcProto = protoOf(protoOf), {state, derive} = van
  let toReactiveObj = (v, protoOfV = protoOf(v)) => protoOfV === objProto ? reactive(v) : v
  let toState = v => {
    let protoOfV = protoOf(v)
    return protoOfV === funcProto ?
      derive(() => toReactiveObj(v())) : state(toReactiveObj(v, protoOfV))
  }
  let statesSym = Symbol()
  let reactive = srcObj => new Proxy(
    Obj.fromEntries(Obj.entries(srcObj).map(([k, v]) => [k, toState(v)])),
    {
      get: (obj, name) => name === statesSym ? obj : obj[name].val,
      set: (obj, name, val) => name in obj ?
        (obj[name].val = toReactiveObj(val), 1) : Reflect.set(obj, name, state(toReactiveObj(val)))
    }
  )
  let stateFields = obj => obj[statesSym]
  window.vanX = {reactive, stateFields}
}