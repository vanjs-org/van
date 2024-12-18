import * as Viz from "@viz-js/viz"
import van from "vanjs-core"

const {b, table, td, tr} = van.tags

let bindingsPropKey: string, listenersPropKey: string, domPropKey: string

const init = () => {
  const viz = Viz.instance()
  const s = <any>van.state(0)
  bindingsPropKey = Object.entries(s)
    .find(([_, v]) => Array.isArray(v))![0]
  listenersPropKey = Object.entries(s)
    .filter(([_, v]) => Array.isArray(v))[1][0]
  van.tags.span(s)
  domPropKey = Object.keys(s[bindingsPropKey][0]).find(k => k !== "f")!

  return viz
}

const {promise: viz, resolve: resolveViz} = Promise.withResolvers<Viz.Viz>()
init().then(viz => resolveViz(viz))

type Options = {
  rankdir?: string
}

type GraphNode = {
  _name: string
  _f?: () => {}
  _state?: any
  _dom?: Node
}

const getLabelHtml = (node: GraphNode) => table({border: 0, cellborder: 1, cellspacing: 0},
  !node._name.startsWith(unnamedPrefix) ? tr(td(b(node._name))) : undefined,
  node._dom ? tr(td(node._dom.nodeName)) : undefined,
  node._state ? tr(td(`State {val: ${JSON.stringify(node._state.rawVal)}}`)) : undefined,
  node._f ? tr(td(node._f.toString() + "\n")) : undefined,
).outerHTML.replaceAll("\n", '<br align="left"/>')

const unnamedPrefix = "<unnamed>_", stateProto = Object.getPrototypeOf(van.state())

const keepConnected = (l: any) => l.filter((b: any) => b[domPropKey]?.isConnected)

const show = async (states: Record<string, any> | any[], {
  rankdir = "LR",
}: Options = {}) => {
  let id = 0
  const newName = () => unnamedPrefix + ++id
  const stateOrDomToNode = new Map<any, GraphNode>(), edges = Array<[GraphNode, GraphNode]>()

  if (Array.isArray(states))
    for (const s of states) stateOrDomToNode.set(s, {_name: newName(), _state: s})
  else
    for (const [name, s] of Object.entries(states)) stateOrDomToNode.set(s, {_name: name, _state: s})

  let iter = stateOrDomToNode.entries()
  for (let item = iter.next(); !item.done; item = iter.next()) {
    const [s, node] = item.value
    if (Object.getPrototypeOf(s) !== stateProto) continue
    s[bindingsPropKey] = keepConnected(s[bindingsPropKey])
    s[listenersPropKey] = keepConnected(s[listenersPropKey])
    for (const b of s[bindingsPropKey]) {
      const dom = b[domPropKey]
      let newNode = stateOrDomToNode.get(dom)
      newNode || stateOrDomToNode.set(dom, newNode = {_name: newName(), _f: b.f, _dom: dom})
      edges.push([node, newNode])
    }
    for (const l of s[listenersPropKey]) {
      const newS = l.s
      let newNode = stateOrDomToNode.get(newS)
      newNode || stateOrDomToNode.set(newS, newNode = {_name: newName(), _state: newS})
      newNode._f = l.f
      edges.push([node, newNode])
    }
  }

  return (await viz).renderSVGElement({
    graphAttributes: {rankdir},
    nodeAttributes: {shape: "plain", fontname: "Courier", fontsize: 10},
    nodes: [...stateOrDomToNode.values()].map(node => ({
      name: node._name,
      attributes: {label: {html: getLabelHtml(node)}},
    })),
    edges: edges.map(([a, b]) => ({tail: a._name, head: b._name}))
  })
}

export {show}
