import van from "./van-0.12.3.js"

// If this variable is set to an Array, we will push the error message into the array instead of
// throwing an error. This is useful in testing, to capture the error occurred asynchronous to the initiating
// callstack. e.g.: a state change can trigger a dom update processing when idle (i.e.: dom update
// processing is set via setTimeout function, which is asynchronous to the initiating callstack).
let capturedErrors

const startCapturingErrors = () => capturedErrors = []

const stopCapturingErrors = () => capturedErrors = null

const expect = (cond, msg) => {
  if (!cond) {
    if (capturedErrors) capturedErrors.push(msg); else throw new Error(msg)
    return false
  }
  return true
}

const protoOf = Object.getPrototypeOf

const stateProto = protoOf(van.state())

const checkStateValValid = v => {
  expect(!(v instanceof Node), "DOM Node is not valid value for state")
  expect(protoOf(v ?? 0) !== stateProto, "State couldn't have value to other state")
  return v
}

const state = initVal => new Proxy(van.state(Object.freeze(checkStateValValid(initVal))), {
  set: (s, prop, val) => {
    if (prop === "val") Object.freeze(checkStateValValid(val))
    return Reflect.set(s, prop, val)
  },

  get: (s, prop) => {
    if (prop === "onnew") return l => {
      expect(typeof l === "function", "You should pass-in functions to register `onnew` handlers")
      s.onnew(l)
    }
    return Reflect.get(s, prop)
  }
})

const isValidPrimitive = v =>
  typeof(v) === "string" ||
  typeof(v) === "number" ||
  typeof(v) === "boolean" ||
  typeof(v) === "bigint"

const isDomOrPrimitive = v => v instanceof Node || isValidPrimitive(v)

const checkChildValid = child => {
  expect(
    isDomOrPrimitive(child) || child === null || child === undefined ||
    protoOf(child ?? 0) === stateProto && (
      isValidPrimitive(child.val) || child.val === null || child.val === undefined),
    "Only DOM Node, string, number, boolean, bigint, null, undefined and state of string, number, boolean, bigint, null or undefined are valid child of a DOM Node",
  )
  expect(!child?.isConnected, "You can't add a DOM Node that is already connected to document")
}

const add = (dom, ...children) => {
  expect(dom instanceof Node, "1st argument of `add` function must be a DOM Node object")
  for (const child of children.flat(Infinity)) checkChildValid(child)
  return van.add(dom, ...children)
}

const _tagsNS = ns => new Proxy(van.tagsNS(ns), {
  get: (vanTags, name) => {
    const vanTag = vanTags[name]
    return (...args) => {
      const [props, ...children] = protoOf(args[0] ?? 0) === Object.prototype ? args : [{}, ...args]
      const debugProps =  {}
      for (const [k, v] of Object.entries(props)) {
        const validatePropValue = k.startsWith("on") ?
          v => (expect(typeof v === "function",
            `Invalid property value for ${k}: Only functions are allowed for on... handler`), v) :
          v => (expect(isValidPrimitive(v),
            `Invalid property value for ${k}: Only string, number, boolean, bigint are valid prop value types`), v)

        if (protoOf(v ?? 0) === stateProto) {
          debugProps[k] = {deps: [v], f: v => validatePropValue(v)}
        } else if (protoOf(v ?? 0) === Object.prototype) {
          expect(Array.isArray(v.deps),
            "For state-derived properties, you want specify an Array in `deps` field")
          expect(typeof v.f === "function",
            "For state-derived properties, you want specify the generation function in `f` field")
          debugProps[k] = {deps: v.deps, f: (...deps) => validatePropValue(v.f(...deps))}
        } else
          debugProps[k] = validatePropValue(v)
      }
      for (const child of children.flat(Infinity)) checkChildValid(child)
      return vanTag(debugProps, ...children)
    }
  },
})

const tagsNS = ns => {
  expect(typeof ns === "string", "Must provide a string for parameter `ns` in `tagsNS`")
  return _tagsNS(ns)
}

const bind = (...deps) => {
  let func = deps.pop()
  expect(deps.length > 0, "`bind` must be called with 1 or more states as dependencies")
  expect(typeof func === "function", "The last argument of `bind` must be the generation function")

  return van.bind(...deps, (...depArgs) => {
    const result = func(...depArgs)
    if (!expect(result === null || result === undefined || isDomOrPrimitive(result),
      "The result of `bind` generation function must be DOM node, primitive, null or undefined")) return null
    if (depArgs.length > deps.length) {
      const prevResult = depArgs[deps.length]
      if (!expect(prevResult instanceof Node && prevResult.isConnected,
        "The previous result of the `bind` generation function must be a DOM node connected to document")) return null
      if (result !== prevResult && result instanceof Node)
        expect(!result.isConnected,
          "If the result of `bind` generation fucntion is not the same as previous one, it shouldn't be already connected to document")
    }
    return result
  })
}

export default {add, tags: _tagsNS(), tagsNS, state, bind, startCapturingErrors, stopCapturingErrors, get capturedErrors() { return capturedErrors }}
