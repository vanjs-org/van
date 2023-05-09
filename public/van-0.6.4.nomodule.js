(() => {
  // van.js
  var doc = document;
  var Obj = Object;
  var toDom = (textOrDom) => textOrDom instanceof Node ? textOrDom : doc.createTextNode(textOrDom);
  var add = (dom, ...children) => children.flat(Infinity).forEach((child) => dom.appendChild(toDom(child)));
  var tag = (name, ...args) => {
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
  };
  var tags = (...names) => Obj.fromEntries(names.map((name) => [name, tag.bind(null, name)]));
  var state = (init) => ({ "val": init, bindings: [] });
  var bind = (deps, domFunc, render = (vals) => toDom(domFunc(...vals))) => {
    deps = [deps].flat();
    let dom = toDom(domFunc(...deps.map((d) => d.val)));
    let binding = { deps, dom, render, domFunc };
    deps.forEach((d) => d.bindings.push(binding));
    return dom;
  };
  var bindingQueue;
  var enqueueBinding = (binding) => bindingQueue = (bindingQueue ?? (setTimeout(dequeueBindingAndUpdateDom, 0), /* @__PURE__ */ new Set())).add(binding);
  var dequeueBindingAndUpdateDom = () => {
    let allBindings = bindingQueue;
    bindingQueue = null;
    allBindings.forEach((b) => {
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
  };
  var setState = (states, vals) => {
    states = [states].flat(), vals = [vals].flat();
    states.forEach((s, i) => {
      s.bindings = s.bindings.filter((b) => b.dom.isConnected);
      if (vals[i] !== s.val) {
        s.oldVal = s.val;
        s.val = vals[i];
        s.bindings.forEach(enqueueBinding);
      }
    });
  };

  // van.forbundle.js
  window.van = { add, tags, state, setState, bind };
})();
