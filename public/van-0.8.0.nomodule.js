(() => {
  // van.js
  var doc = document;
  var Obj = Object;
  var Null = null;
  var toDom = (textOrDom) => textOrDom instanceof Node ? textOrDom : doc.createTextNode(textOrDom);
  var add = (dom, ...children) => children.flat(Infinity).forEach((child) => dom.appendChild(toDom(child)));
  var tags = new Proxy((name, ...args) => {
    let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args];
    let dom = doc.createElement(name);
    Obj.entries(props).forEach(([k, v]) => {
      if (v)
        if (k.startsWith("on"))
          dom[k] = v;
        else
          dom.setAttribute(k, v);
    });
    add(dom, ...children);
    return dom;
  }, { get(tag, name) {
    return tag.bind(Null, name);
  } });
  var changedStates;
  var enqueueState = (s) => changedStates = (changedStates ?? (setTimeout(updateDoms), /* @__PURE__ */ new Set())).add(s);
  var setState = (s, val) => {
    if (val !== s.val) {
      if (!s.oldVal) {
        enqueueState(s);
        s.oldVal = s.val;
      } else if (val === s.oldVal) {
        s.oldVal = Null;
        changedStates.delete(s);
      }
      s.val = val;
    }
  };
  var updateDoms = () => {
    let changedStatesArray = [...changedStates];
    changedStates = Null;
    new Set(changedStatesArray.flatMap((s) => s.bindings = s.bindings.filter((b) => b.dom.isConnected))).forEach((b) => {
      let { dom, deps, render } = b;
      if (dom.isConnected) {
        let vals = deps.map((d) => d.val), oldVals = deps.map((d) => d.oldVal);
        let newDom = render(vals, oldVals, dom, b.domFunc);
        if (newDom !== dom) {
          dom.replaceWith(newDom);
          b.dom = newDom;
        }
      }
    });
    changedStatesArray.forEach((s) => s.oldVal = Null);
  };
  var state = (init) => {
    let s = { "val": init, bindings: [] };
    return [s, setState.bind(Null, s)];
  };
  var bind = (deps, domFunc, render = (vals) => toDom(domFunc(...vals))) => {
    deps = [deps].flat();
    let dom = toDom(domFunc(...deps.map((d) => d.val)));
    let binding = { deps, dom, render, domFunc };
    deps.forEach((d) => d.bindings.push(binding));
    return dom;
  };

  // van.forbundle.js
  van = { add, tags, state, bind };
})();
