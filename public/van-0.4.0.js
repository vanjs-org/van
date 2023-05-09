// Aliasing some builtin functions to reduce the bundle size.
// Also, this file consistently uses `let` keyword instead of `const` for the same purpose.

let isArr = Array.isArray, doc = document

let toDom = textOrDom => typeof textOrDom !== "object" ? doc.createTextNode(textOrDom) : textOrDom

export let add = (dom, ...children) => {
  for (let child of children)
    isArr(child) ? add(dom, ...child) : dom.appendChild(toDom(child))
}

let tag = (name, ...args) => {
  let [props, children] =
    typeof args[0] !== "object" || args[0] instanceof Node || isArr(args[0]) ?
    [{}, args] : [args[0], args.slice(1)]
  let dom = doc.createElement(name)
  for (let [k, v] of Object.entries(props))
    if (v)
      if (k.startsWith("on")) dom[k] = v
      else dom.setAttribute(k, v)
  add(dom, ...children)
  return dom
}

export let tags = (...names) => 
  Object.fromEntries(names.map(name => [name, tag.bind(null, name)]))

export let state = init => ({"val": init, bindings: []})

export let bind = (deps, domFunc, render = vals => toDom(domFunc(...vals))) => {
  if (!isArr(deps)) return bind([deps], domFunc, render)
  let dom = toDom(domFunc(...deps.map(d => d.val)))
  let binding = {deps, dom, render}
  for (let d of deps) d.bindings.push(binding)
  return dom
}

export let setState = (states, vals) => {
  if (!isArr(states)) return setState([states], [vals])
  let allBindings = new Set()
  for (let i = 0; i < states.length; ++i) {
    let s = states[i]
    s.bindings = s.bindings.filter(b => b.dom.isConnected)
    if (vals[i] !== s.val) {
      s.oldVal = s.val
      s.val = vals[i]
      for (let b of s.bindings) allBindings.add(b)
    }
  }

  for (let b of allBindings) {
    let {dom, deps, render} = b
    if (!dom.isConnected) continue
    let vals = deps.map(d => d.val), oldVals = deps.map(d => d.oldVal)
    let newDom = render(vals, oldVals, dom)
    if (newDom !== dom) {
      dom.replaceWith(newDom)
      b.dom = newDom
    }
  }
}
