import van from "./van-1.1.2.js"

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
  expect(!isState(v), "State couldn't have value to other state")
  expect(!(v instanceof Node), "DOM Node is not valid value for state")
  return v
}

const state = initVal => new Proxy(van.state(Object.freeze(checkStateValValid(initVal))), {
  set: (s, prop, val) => {
    prop === "val" && Object.freeze(checkStateValValid(val))
    return Reflect.set(s, prop, val)
  }
})

const derive = f => {
  expect(typeof(f) === "function", "Must pass-in a function to `van.derive`")
  return van.derive(f)
}

const isValidPrimitive = v =>
  typeof(v) === "string" ||
  typeof(v) === "number" ||
  typeof(v) === "boolean" ||
  typeof(v) === "bigint"

const isDomOrPrimitive = v => v instanceof Node || isValidPrimitive(v)

const validateChild = child => {
  expect(
    isDomOrPrimitive(child) || child === null || child === undefined,
    "Only DOM Node, string, number, boolean, bigint, null, undefined are valid child of a DOM Element",
  )
  return child
}

const checkChildren = children => children.flat(Infinity).map(c => {
  const withResultValidation = f => dom => {
    const r = validateChild(f(dom))
    if (r !== dom && r instanceof Node)
      expect(!r.isConnected,
        "If the result of complex binding function is not the same as previous one, it shouldn't be already connected to document")
    return r
  }
  if (isState(c)) return withResultValidation(() => c.val)
  if (typeof c === "function") return withResultValidation(c)
  expect(!c?.isConnected, "You can't add a DOM Node that is already connected to document")
  return validateChild(c)
})

const add = (dom, ...children) => {
  expect(dom instanceof Element, "1st argument of `van.add` function must be a DOM Element object")
  return van.add(dom, ...checkChildren(children))
}

const _ = f => {
  expect(typeof(f) === "function", "Must pass-in a function to `van._`")
  return van._(f)
}

const _tagsNS = ns => new Proxy(van.tagsNS(ns), {
  get: (vanTags, name) => {
    const vanTag = vanTags[name]
    return (...args) => {
      const [props, ...children] = protoOf(args[0] ?? 0) === Object.prototype ? args : [{}, ...args]
      const debugProps =  {}
      for (const [k, v] of Object.entries(props)) {
        const validatePropValue = k.startsWith("on") ?
          v => (expect(typeof v === "function" || v === null,
            `Invalid property value for ${k}: Only functions and null are allowed for on... handler`), v) :
          v => (expect(isValidPrimitive(v) || v === null,
            `Invalid property value for ${k}: Only string, number, boolean, bigint and null are valid prop value types`), v)

        if (isState(v))
          debugProps[k] = van._(() => validatePropValue(v.val))
        else if (typeof v === "function" && (!k.startsWith("on") || v._isBindingFunc))
          debugProps[k] = van._(() => validatePropValue(v()))
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

export default {add, _, tags: _tagsNS(), tagsNS, state, val: van.val, oldVal: van.oldVal, derive, startCapturingErrors, stopCapturingErrors, get capturedErrors() { return capturedErrors }}
