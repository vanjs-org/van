// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let doc = document, Obj = Object

let toDom = textOrDom => textOrDom instanceof Node ? textOrDom : doc.createTextNode(textOrDom)

export let add = (dom, ...children) => 
  children.flat(Infinity).forEach(child => dom.appendChild(toDom(child)))

let tag = (name, ...args) => {
  let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args]
  let dom = doc.createElement(name)
  Obj.entries(props).forEach(([k, v]) => {
    if (v)
      if (k.startsWith("on")) dom[k] = v
      else dom.setAttribute(k, v)
  })
  add(dom, ...children)
  return dom
}

export let tags = (...names) => 
  Obj.fromEntries(names.map(name => [name, tag.bind(null, name)]))

export let state = init => ({"val": init, bindings: []})

export let bind = (deps, domFunc, render = vals => toDom(domFunc(...vals))) => {
  deps = [deps].flat()
  let dom = toDom(domFunc(...deps.map(d => d.val)))
  let binding = {deps, dom, render, domFunc}
  deps.forEach(d => d.bindings.push(binding))
  return dom
}

let bindingQueue

let enqueueBinding = binding =>
  bindingQueue = (bindingQueue ?? (setTimeout(dequeueBindingAndUpdateDom, 0), new Set()))
    .add(binding)

let dequeueBindingAndUpdateDom = () => {
  let allBindings = bindingQueue
  bindingQueue = null

  allBindings.forEach(b => {
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
}

export let setState = (states, vals) => {
  states = [states].flat(), vals = [vals].flat()
  states.forEach((s, i) => {
    s.bindings = s.bindings.filter(b => b.dom.isConnected)
    if (vals[i] !== s.val) {
      s.oldVal = s.val
      s.val = vals[i]
      s.bindings.forEach(enqueueBinding)
    }
  })
}
