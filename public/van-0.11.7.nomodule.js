(() => {
  // van.js
  var Obj = Object;
  var _undefined;
  var protoOf = Object.getPrototypeOf;
  var addAndScheduleOnFirst = (set, s, func, waitMs) => (set ?? (setTimeout(func, waitMs), /* @__PURE__ */ new Set())).add(s);
  var changedStates;
  var stateProto = {
    get "val"() {
      return this._val;
    },
    set "val"(v) {
      let s = this, curV = s._val;
      if (v !== curV) {
        if (s.oldVal === curV)
          changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms);
        else if (v === s.oldVal)
          changedStates.delete(s);
        s._val = v;
        s.listeners.forEach((l) => l(v, curV));
      }
    },
    "onnew"(l) {
      this.listeners.push(l);
    }
  };
  var objProto = protoOf(stateProto);
  var state = (initVal) => ({
    __proto__: stateProto,
    _val: initVal,
    oldVal: initVal,
    bindings: [],
    listeners: []
  });
  var toDom = (v) => v.nodeType ? v : new Text(v);
  var add = (dom, ...children) => children.flat(Infinity).forEach((child) => dom.appendChild(
    protoOf(child) === stateProto ? bind(child, (v) => v) : toDom(child)
  ));
  var tags = new Proxy((name, ...args) => {
    let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = document.createElement(name);
    Obj.entries(props).forEach(([k, v]) => {
      let setter = dom[k] !== void 0 ? (v2) => dom[k] = v2 : (v2) => dom.setAttribute(k, v2);
      if (protoOf(v) === stateProto)
        bind(v, (v2) => (setter(v2), dom));
      else if (protoOf(v) === objProto)
        bind(...v["deps"], (...deps) => (setter(v["f"](...deps)), dom));
      else
        setter(v);
    });
    add(dom, ...children);
    return dom;
  }, { get: (tag, name) => tag.bind(_undefined, name) });
  var filterBindings = (s) => s.bindings = s.bindings.filter((b) => b.dom?.isConnected);
  var updateDoms = () => {
    let changedStatesArray = [...changedStates];
    changedStates = _undefined;
    new Set(changedStatesArray.flatMap(filterBindings)).forEach((b) => {
      let { _deps, dom, func } = b;
      let newDom = func(..._deps.map((d) => d._val), dom, ..._deps.map((d) => d.oldVal));
      if (newDom !== dom)
        if (newDom != _undefined)
          dom.replaceWith(b.dom = toDom(newDom));
        else
          dom.remove(), b.dom = _undefined;
    });
    changedStatesArray.forEach((s) => s.oldVal = s._val);
  };
  var bindingGcCycleInMs = 1e3;
  var statesToGc;
  var bind = (...args) => {
    let deps = args.slice(0, -1), func = args[args.length - 1];
    let result = func(...deps.map((d) => d._val));
    if (result == _undefined)
      return [];
    let binding = { _deps: deps, dom: toDom(result), func };
    deps.forEach((s) => {
      statesToGc = addAndScheduleOnFirst(
        statesToGc,
        s,
        () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
        bindingGcCycleInMs
      );
      s.bindings.push(binding);
    });
    return binding.dom;
  };
  var van_default = { add, tags, state, bind };

  // van.forbundle.js
  window.van = van_default;
})();
