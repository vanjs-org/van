export const add = (dom, ...children) => {
  for (const child of children)
    if (typeof child !== "object")
      dom.appendChild(document.createTextNode(child))
    else if (Array.isArray(child))
      add(dom, ...child)
    else
      dom.appendChild(child)
}

export const tag = (name, ...args) => {
  const [props, children] =
    args.length === 0 || typeof args[0] !== "object" || args[0] instanceof Node || Array.isArray(args[0]) ?
    [{}, args] : [args[0], args.slice(1)]
  const dom = document.createElement(name)
  for (const [k, v] of Object.entries(props))
    if (v)
      if (k.startsWith("on")) dom[k] = v
      else dom.setAttribute(k, v)
  add(dom, ...children)
  return dom
}

export const registerTags = (obj, ...tagNames) => {
  for (const name of tagNames) obj[name] = (...args) => tag(name, ...args)
}

export const state = init => ({"val": init, bindings: []})

const strToTextDom = dom => typeof dom !== "object" ? document.createTextNode(dom) : dom

export const bind = (deps, domFunc, render = vals => strToTextDom(domFunc(...vals))) => {
  const dom = strToTextDom(domFunc(...deps.map(d => d.val)))
  const binding = {deps, dom, render}
  for (const d of deps) d.bindings.push(binding)
  return dom
}

export const setState = (states, vals) => {
  if (!Array.isArray(states)) return setState([states], [vals])
  const allBindings = new Set()
  for (let i = 0; i < states.length; ++i) {
    const s = states[i]
    s.bindings = s.bindings.filter(b => b.dom.isConnected)
    if (vals[i] !== s.val) {
      s.oldVal = s.val
      s.val = vals[i]
      for (const b of s.bindings) allBindings.add(b)
    }
  }

  for (const b of allBindings) {
    const {dom, deps, render} = b
    if (!dom.isConnected) continue
    const [vals, oldVals] = [deps.map(d => d.val), deps.map(d => d.oldVal)]
    const newDom = render(vals, oldVals, dom)
    if (newDom !== dom) {
      dom.replaceWith(newDom)
      b.dom = newDom
    }
  }
}
