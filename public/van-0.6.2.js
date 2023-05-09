// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let isArr = Array.isArray, doc = document

let toDom = textOrDom => textOrDom instanceof Node ? textOrDom : doc.createTextNode(textOrDom)

export let add = (dom, ...children) => 
  children.forEach(child =>
    isArr(child) ? add(dom, ...child) : dom.appendChild(toDom(child)))

let tag = (name, ...args) => {
  let [props, children] = args[0]?.constructor === Object ? [args[0], args.slice(1)] : [{}, args]
  let dom = doc.createElement(name)
  Object.entries(props).forEach(([k, v]) => {
    if (v)
      if (k.startsWith("on")) dom[k] = v
      else dom.setAttribute(k, v)
  })
  add(dom, ...children)
  return dom
}

export let tags = (...names) => 
  Object.fromEntries(names.map(name => [name, tag.bind(null, name)]))

export let state = init => ({"val": init, bindings: []})

export let bind = (deps, domFunc, render = vals => toDom(domFunc(...vals))) => {
  if (!isArr(deps)) return bind([deps], domFunc, render)
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
  if (!isArr(states)) return setState([states], [vals])
  states.forEach((s, i) => {
    s.bindings = s.bindings.filter(b => b.dom.isConnected)
    if (vals[i] !== s.val) {
      s.oldVal = s.val
      s.val = vals[i]
      s.bindings.forEach(enqueueBinding)
    }
  })
}
