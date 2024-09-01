import * as Viz from "@viz-js/viz";
import van from "vanjs-core";
let bindingsPropKey, listenersPropKey, domPropKey;
const init = () => {
    const viz = Viz.instance();
    const s = van.state(0);
    bindingsPropKey = Object.entries(s)
        .find(([_, v]) => Array.isArray(v))[0];
    listenersPropKey = Object.entries(s)
        .filter(([_, v]) => Array.isArray(v))[1][0];
    van.tags.span(s);
    domPropKey = Object.keys(s[bindingsPropKey]).find(k => k !== "f");
    return viz;
};
const { promise: viz, resolve: resolveViz } = Promise.withResolvers();
init().then(viz => resolveViz(viz));
const getLabel = (node) => [node._name].concat(node._f?.toString() ?? [], node._state ? `State {val: ${node._state.rawVal}}` : [], node._dom ? node._dom.nodeName : []).join(" | ");
const anonymousPrefix = "<anonymous>_", stateProto = Object.getPrototypeOf(van.state());
const keepConnected = (l) => l.filter((b) => b[domPropKey]?.isConnected);
const show = async (states, { rankdir = "TB", } = {}) => {
    let id = 0;
    const newName = () => anonymousPrefix + ++id;
    const stateOrDomToNode = new Map(), edges = Array();
    if (Array.isArray(states))
        for (const s of states)
            stateOrDomToNode.set(s, { _name: newName(), _state: s });
    else
        for (const [name, s] of Object.entries(states))
            stateOrDomToNode.set(s, { _name: name, _state: s });
    let iter = stateOrDomToNode.entries();
    for (let item = iter.next(); !item.done; item = iter.next()) {
        const [s, node] = item.value;
        if (Object.getPrototypeOf(s) !== stateProto)
            continue;
        s[bindingsPropKey] = keepConnected(s[bindingsPropKey]);
        s[listenersPropKey] = keepConnected(s[listenersPropKey]);
        for (const b of s[bindingsPropKey]) {
            const dom = b[domPropKey];
            let newNode = stateOrDomToNode.get(dom);
            newNode || stateOrDomToNode.set(dom, newNode = { _name: newName(), _f: b.f, _dom: dom });
            edges.push([node, newNode]);
        }
        for (const l of s[listenersPropKey]) {
            const newS = l.s;
            let newNode = stateOrDomToNode.get(newS);
            newNode || stateOrDomToNode.set(newS, newNode = { _name: newName(), _f: l.f, _state: newS });
            edges.push([node, newNode]);
        }
    }
    return (await viz).renderSVGElement({
        graphAttributes: { rankdir },
        nodeAttributes: { shape: "record" },
        nodes: [...stateOrDomToNode.values()].map(node => ({
            name: node._name,
            attributes: { label: getLabel(node) },
        })),
        edges: edges.map(([a, b]) => ({ tail: a._name, head: b._name }))
    });
};
export { show };
