export let add = (dom, ...children) => {
  for (let child of children)
    if (typeof child !== "object")
      dom.appendChild(document.createTextNode(child))
    else if (Array.isArray(child))
      add(dom, ...child)
    else
      dom.appendChild(child)
}

export let tag = (name, ...args) => {
  let [props, children] =
    typeof args[0] !== "object" || args[0] instanceof Node || Array.isArray(args[0]) ?
    [{}, args] : [args[0], args.slice(1)]
  let dom = document.createElement(name)
  for (let [k, v] of Object.entries(props))
    if (v)
      if (k.startsWith("on")) dom[k] = v
      else dom.setAttribute(k, v)
  add(dom, ...children)
  return dom
}

export let registerTags = (o, ...tagNames) => {
  if (typeof o !== "object") return registerTags(window, o, ...tagNames)
  for (let name of tagNames) o[name] = (...args) => tag(name, ...args)
  return o
}

export let state = init => ({"val": init, bindings: []})

let strToTextDom = dom => typeof dom !== "object" ? document.createTextNode(dom) : dom

export let bind = (deps, domFunc, render = vals => strToTextDom(domFunc(...vals))) => {
  if (!Array.isArray(deps)) return bind([deps], domFunc, render)
  let dom = strToTextDom(domFunc(...deps.map(d => d.val)))
  let binding = {deps, dom, render}
  for (let d of deps) d.bindings.push(binding)
  return dom
}

export let setState = (states, vals) => {
  if (!Array.isArray(states)) return setState([states], [vals])
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
    let [vals, oldVals] = [deps.map(d => d.val), deps.map(d => d.oldVal)]
    let newDom = render(vals, oldVals, dom)
    if (newDom !== dom) {
      dom.replaceWith(newDom)
      b.dom = newDom
    }
  }
}
