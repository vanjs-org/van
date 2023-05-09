(() => {
  // van.js
  var doc = document;
  var Obj = Object;
  var Null = null;
  var changedStates;
  var enqueueState = (s) => changedStates = (changedStates ?? (setTimeout(updateDoms), /* @__PURE__ */ new Set())).add(s);
  var State = class {
    constructor(v) {
      this._val = v;
      this.bindings = [];
      this.derivedStateSetters = [];
    }
    get "val"() {
      return this._val;
    }
    set "val"(v) {
      let s = this;
      if (v !== s._val) {
        if (!s.oldVal) {
          enqueueState(s);
          s.oldVal = s._val;
        } else if (v === s.oldVal) {
          s.oldVal = Null;
          changedStates.delete(s);
        }
        s._val = v;
        s.derivedStateSetters.forEach((d) => d());
      }
    }
  };
  var state = (initVal) => new State(initVal);
  var toDom = (input) => input instanceof Node ? input : input instanceof State ? bind(input, (v) => doc.createTextNode(v)) : doc.createTextNode(input);
  var add = (dom, ...children) => children.flat(Infinity).forEach((child) => dom.appendChild(toDom(child)));
  var tags = new Proxy((name, ...args) => {
    let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args];
    let dom = doc.createElement(name);
    Obj.entries(props).forEach(([k, v]) => {
      if (v)
        if (k.startsWith("on"))
          dom[k] = v;
        else if (v instanceof State)
          bind(v, (v2) => (dom[k] = v2, dom));
        else
          dom.setAttribute(k, v);
    });
    add(dom, ...children);
    return dom;
  }, { get: (tag, name) => tag.bind(Null, name) });
  var updateDoms = () => {
    let changedStatesArray = [...changedStates];
    changedStates = Null;
    new Set(changedStatesArray.flatMap(
      (s) => s.bindings = s.bindings.filter((b) => b.dom?.isConnected)
    )).forEach((b) => {
      let { dom, deps, func } = b;
      let newDom = func(...deps.map((d) => d._val), dom, ...deps.map((d) => d.oldVal));
      if (newDom !== dom) {
        if (newDom)
          dom.replaceWith(newDom);
        else
          dom.remove();
        b.dom = newDom;
      }
    });
    changedStatesArray.forEach((s) => s.oldVal = Null);
  };
  var bind = (...args) => {
    let deps = args.slice(0, -1), func = args[args.length - 1];
    let result = func(...deps.map((d) => d._val));
    if (result instanceof Node) {
      let binding = { deps, dom: result, func };
      deps.forEach((d) => d.bindings.push(binding));
      return result;
    }
    let resultState = state(result);
    let setter = () => resultState.val = func(
      ...deps.map((d) => d._val),
      resultState._val,
      ...deps.map((d) => d.oldVal)
    );
    deps.forEach((d) => d.derivedStateSetters.push(setter));
    return resultState;
  };

  // van.forbundle.js
  window.van = { add, tags, state, bind };
})();
