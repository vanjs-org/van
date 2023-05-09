// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let doc = document, Obj = Object, Null = null

let toDom = textOrDom => textOrDom instanceof Node ? textOrDom : doc.createTextNode(textOrDom)

export let add = (dom, ...children) => 
  children.flat(Infinity).forEach(child => dom.appendChild(toDom(child)))

export let tags = new Proxy((name, ...args) => {
  let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args]
  let dom = doc.createElement(name)
  Obj.entries(props).forEach(([k, v]) => {
    if (v)
      if (k.startsWith("on")) dom[k] = v
      else dom.setAttribute(k, v)
  })
  add(dom, ...children)
  return dom
}, {get: (tag, name) => tag.bind(Null, name)})

let changedStates

let enqueueState = s =>
  changedStates = (changedStates ?? (setTimeout(updateDoms), new Set)).add(s)

let setState = (s, val) => {
  if (val !== s.val) {
    if (!s.oldVal) {
      enqueueState(s)
      s.oldVal = s.val
    } else if (val === s.oldVal) {
      s.oldVal = Null
      changedStates.delete(s)
    }
    s.val = val
  }
}

let updateDoms = () => {
  let changedStatesArray = [...changedStates]
  changedStates = Null
  new Set(changedStatesArray.flatMap(s => s.bindings = s.bindings.filter(b => b.dom.isConnected))).forEach(b => {
    let {dom, deps, render} = b
    if (dom.isConnected) {
      let vals = deps.map(d => d.val), oldVals = deps.map(d => d.oldVal)
      let newDom = render(vals, oldVals, dom, b.domFunc)
      if (newDom !== dom) {
        dom.replaceWith(newDom)
        b.dom = newDom
      }
    }
  })
  changedStatesArray.forEach(s => s.oldVal = Null)
}

export let state = init => {
  let s = {"val": init, bindings: []}
  return [s, setState.bind(Null, s)]
}

export let bind = (deps, domFunc, render = vals => toDom(domFunc(...vals))) => {
  deps = [deps].flat()
  let dom = toDom(domFunc(...deps.map(d => d.val)))
  let binding = {deps, dom, render, domFunc}
  deps.forEach(d => d.bindings.push(binding))
  return dom
}
