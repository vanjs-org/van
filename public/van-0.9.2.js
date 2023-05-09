// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let doc = document, Obj = Object, Null = null

let changedStates

let enqueueState = s =>
  changedStates = (changedStates ?? (setTimeout(updateDoms), new Set)).add(s)

class State {
  constructor(v) {
    this._val = v
    this.bindings = []
    this.derivedStateSetters = []
  }

  get "val"() {
    return this._val
  }

  set "val"(v) {
    // Aliasing `this` to reduce the bundle size.
    let s = this
    if (v !== s._val) {
      if (!s.oldVal) {
        enqueueState(s)
        s.oldVal = s._val
      } else if (v === s.oldVal) {
        s.oldVal = Null
        changedStates.delete(s)
      }
      s._val = v
      s.derivedStateSetters.forEach(d => d())
    }
  }
}

export let state = initVal => new State(initVal)

let toDom = input => input instanceof Node ? input :
  (input instanceof State ?
    bind(input, v => doc.createTextNode(v)) : doc.createTextNode(input))

export let add = (dom, ...children) => 
  children.flat(Infinity).forEach(child => dom.appendChild(toDom(child)))

export let tags = new Proxy((name, ...args) => {
  let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args]
  let dom = doc.createElement(name)
  Obj.entries(props).forEach(([k, v]) => {
    if (v)
      if (k.startsWith("on")) dom[k] = v
      else if (v instanceof State) bind(v, v => (dom[k] = v, dom))
      else dom.setAttribute(k, v)
  })
  add(dom, ...children)
  return dom
}, {get: (tag, name) => tag.bind(Null, name)})

let updateDoms = () => {
  let changedStatesArray = [...changedStates]
  changedStates = Null
  new Set(changedStatesArray.flatMap(
    s => s.bindings = s.bindings.filter(b => b.dom?.isConnected))).forEach(b => {
    let {dom, deps, func} = b
    let newDom = func(...deps.map(d => d._val), dom, ...deps.map(d => d.oldVal))
    if (newDom !== dom) {
      if (newDom) dom.replaceWith(newDom); else dom.remove()
      b.dom = newDom
    }
  })
  changedStatesArray.forEach(s => s.oldVal = Null)
}

export let bind = (...args) => {
  let deps = args.slice(0, -1), func = args[args.length - 1]
  let result = func(...deps.map(d => d._val))
  if (result instanceof Node) {
    let binding = {deps, dom: result, func}
    deps.forEach(d => d.bindings.push(binding))
    return result
  }
  let resultState = state(result)
  let setter = () =>
    resultState.val = func(
      ...deps.map(d => d._val), resultState._val, ...deps.map(d => d.oldVal))
  deps.forEach(d => d.derivedStateSetters.push(setter))
  return resultState
}
