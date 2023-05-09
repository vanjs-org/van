import * as van from "./van-0.10.1.js" 

// If this variable is set to an Array, we will push the error message into the array instead of
// throwing an error. This is useful in testing, to capture the error occurred asynchronous to the initiating
// callstack. e.g.: a state change can trigger a dom update processing when idle (i.e.: dom update
// processing is set via setTimeout function, which is asynchronous to the initiating callstack).
export let capturedErrors

export const startCapturingErrors = () => capturedErrors = []

export const stopCapturingErrors = () => capturedErrors = null

const expect = (cond, msg) => {
  if (!cond) {
    if (capturedErrors) capturedErrors.push(msg); else throw new Error(msg)
    return false
  }
  return true
}

const State = van.state().constructor

const checkStateValValid = v => {
  expect(!(v instanceof Node), "DOM Node is not valid value for state")
  expect(!(v instanceof State), "State couldn't have value to other state")
}

export const state = initVal => {
  checkStateValValid(initVal)
  return new Proxy(van.state(initVal), {
    set: (s, name, val) => {
      if (name === "val") {
        checkStateValValid(val)
        s.val = val
      } else
        s[name] = val
      return true
    },
  })
}

const isValidPrimitive = v =>
  typeof(v) === "string" ||
  typeof(v) === "number" ||
  typeof(v) === "boolean" ||
  typeof(v) === "bigint"

const checkChildValid = child => {
  expect(
    child instanceof Node || isValidPrimitive(child) || child instanceof State && isValidPrimitive(child.val),
    "Only DOM Node, string, number, boolean, bigint, and state of string, number, boolean or bigint are valid child of a DOM Node"
  )
  expect(!child.isConnected, "You can't add a DOM Node that is already connected to a DOM document")
}

export const add = (dom, ...children) => {
  expect(dom instanceof Node, "1st argument of `add` function must be a DOM Node object")
  children.flat(Infinity).forEach(child => checkChildValid(child))
  van.add(dom, ...children)
}

export const tags = new Proxy(van.tags, {
  get: (vanTags, name) => {
    const vanTag = vanTags[name]
    return (...args) => {
      let [props, ...children] = args[0]?.constructor === Object ? args : [{}, ...args]
      for (const [k, v] of Object.entries(props)) {
        if (k.startsWith("on"))
          expect(typeof v === "function", "Value for on... handler must be of function type")
        else {
          expect(isValidPrimitive(v) || v instanceof State && isValidPrimitive(v.val),
            "Only string, number, boolean, bigint, and state of string, number, boolean or bigint are valid prop value types"
          )
          if (v instanceof State)
            expect(k !== "class", "When prop value is a state, we set the value on DOM Node properties directly. Thus you probably want to use `classList` instead of `class` here")
          else
            expect(k !== "classList", "When prop value is a primitive type, we set the value via setAttribute instead of setting via DOM Node properties. Thus you probably want to use `class` instead of `classList` here")
        }
      }
      children.flat(Infinity).forEach(child => checkChildValid(child))
      return vanTag(...args)
    }
  },
})

export const empty = van.empty

export const bind = (...args) => {
  const deps = args.slice(0, -1), func = args[args.length - 1]
  expect(deps.length > 0, "`bind` must be called with 1 or more states as dependencies")
  deps.forEach(d => expect(d instanceof State, "Dependencies in `bind` must be states"))
  expect(typeof func === "function", "The last argument of `bind` must be the generation function")
  const result = func(...deps.map(d => d.val))
  expect(!(result instanceof State), "The result of `bind` generation function can't be a state object")
  return van.bind(...deps, (...genArgs) => {
    const result = func(...genArgs)
    expect(!(result instanceof State), "The result of `bind` generation function can't be a state object")

    if (genArgs.length > deps.length) {
      const prevResult = genArgs[deps.length]
      if (prevResult instanceof Node) {
        expect(prevResult.isConnected, "For binding to DOM Node, the previous result of generation function must be connected to a DOM document")
        if (!expect(result instanceof Node || result === empty,
          "For binding to DOM Node, the result of generation function must be also a DOM object, or `van.empty`"))
          return empty
        if (result && result !== prevResult)
          if (!expect(!result.isConnected,
            "For binding to DOM Node, if the result of generation function is not the same as previous one, it shouldn't be already connected to a DOM document")) return empty
      } else
        expect(!(result instanceof Node) && result !== empty,
          "For binding to derived state, the result of generation function can't be a DOM object, or van.empty")
    }
    return result
  })
}
