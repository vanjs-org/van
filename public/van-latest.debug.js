import van from "./van-latest.js"

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
const isState = s => protoOf(s ?? 0) === stateProto

const checkStateValValid = v => {
  expect(!(v instanceof Node), "DOM Node is not valid value for state")
  expect(!isState(v), "State couldn't have value to other state")
  return v
}

const state = initVal => new Proxy(van.state(Object.freeze(checkStateValValid(initVal))), {
  set: (s, prop, val) => {
    if (prop === "val") Object.freeze(checkStateValValid(val))
    return Reflect.set(s, prop, val)
  },

  get: (s, prop) => { return Reflect.get(s, prop) }
})

const effect = f => {
  expect(typeof(f) === "function", "Must pass-in a function to `van.effect`")
  van.effect(f)
}

const isValidPrimitive = v =>
  typeof(v) === "string" ||
  typeof(v) === "number" ||
  typeof(v) === "boolean" ||
  typeof(v) === "bigint"

const isDomOrPrimitive = v => v instanceof Node || isValidPrimitive(v)

const checkChildValid = child => {
  expect(
    isDomOrPrimitive(child) || child === null || child === undefined ||
    isState(child) && (
      isValidPrimitive(child.val) || child.val === null || child.val === undefined),
    "Only DOM Node, string, number, boolean, bigint, null, undefined and state of string, number, boolean, bigint, null or undefined are valid child of a DOM Node",
  )
  expect(!child?.isConnected, "You can't add a DOM Node that is already connected to document")
}

const checkChildren = children => children.flat(Infinity).map(c => {
  if (typeof c === "function") return dom => {
    const r = c(dom)
    if (!expect(r === null || r === undefined || isDomOrPrimitive(r),
      "The result of `bind` generation function must be DOM node, primitive, null or undefined")) return null
    if (r !== dom && r instanceof Node)
      expect(!r.isConnected,
        "If the result of complex binding function is not the same as previous one, it shouldn't be already connected to .document")
    return r
  }
  checkChildValid(c)
  return c
})

const add = (dom, ...children) => {
  expect(dom instanceof Element, "1st argument of `van.add` function must be a DOM Element object")
  return van.add(dom, ...checkChildren(children))
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

        if (k.startsWith("on")) {
          validatePropValue(van.val(v))
          debugProps[k] = v
        } else if (isState(v))
          debugProps[k] = () => validatePropValue(v.val)
        else if (typeof v === "function")
          debugProps[k] = () => validatePropValue(v())
        else
          debugProps[k] = validatePropValue(v)
      }
      return vanTag(debugProps, ...checkChildren(children))
    }
  },
})

const tagsNS = ns => {
  expect(typeof ns === "string", "Must provide a string for parameter `ns` in `van.tagsNS`")
  return _tagsNS(ns)
}

export default {add, tags: _tagsNS(), tagsNS, state, val: van.val, oldVal: van.oldVal, effect, startCapturingErrors, stopCapturingErrors, get capturedErrors() { return capturedErrors }}
