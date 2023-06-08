(() => {
  // van.js
  var Obj = Object;
  var _undefined;
  var protoOf = Obj.getPrototypeOf;
  var doc = document;
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
        for (let l of s.listeners)
          l(v, curV);
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
  var add = (dom, ...children) => {
    for (let child of children.flat(Infinity))
      dom.appendChild(protoOf(child) === stateProto ? bind(child, (v) => v) : toDom(child));
    return dom;
  };
  var isSettablePropCache = {};
  var getPropDescriptor = (proto, key) => proto ? Obj.getOwnPropertyDescriptor(proto, key) ?? getPropDescriptor(protoOf(proto), key) : _undefined;
  var isSettableProp = (tag, key, proto) => isSettablePropCache[tag + "," + key] ?? (isSettablePropCache[tag + "," + key] = getPropDescriptor(proto, key)?.set ?? 0);
  var tagsNS = (ns) => new Proxy((name, ...args) => {
    let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = ns ? doc.createElementNS(ns, name) : doc.createElement(name);
    for (let [k, v] of Obj.entries(props)) {
      let setter = isSettableProp(name, k, protoOf(dom)) ? (v2) => dom[k] = v2 : (v2) => dom.setAttribute(k, v2);
      if (protoOf(v) === stateProto)
        bind(v, (v2) => (setter(v2), dom));
      else if (protoOf(v) === objProto)
        bind(...v["deps"], (...deps) => (setter(v["f"](...deps)), dom));
      else
        setter(v);
    }
    return add(dom, ...children);
  }, { get: (tag, name) => tag.bind(_undefined, name) });
  var filterBindings = (s) => s.bindings = s.bindings.filter((b) => b.dom?.isConnected);
  var getVals = (deps) => deps.map((d) => protoOf(d ?? 0) === stateProto ? d._val : d);
  var getOldVals = (deps) => deps.map((d) => protoOf(d ?? 0) === stateProto ? d.oldVal : d);
  var updateDoms = () => {
    let changedStatesArray = [...changedStates];
    changedStates = _undefined;
    for (let b of new Set(changedStatesArray.flatMap(filterBindings))) {
      let { _deps, dom } = b;
      let newDom = b.func(...getVals(_deps), dom, ...getOldVals(_deps));
      if (newDom !== dom)
        if (newDom != _undefined)
          dom.replaceWith(b.dom = toDom(newDom));
        else
          dom.remove(), b.dom = _undefined;
    }
    for (let s of changedStatesArray)
      s.oldVal = s._val;
  };
  var bindingGcCycleInMs = 1e3;
  var statesToGc;
  var bind = (...deps) => {
    let func = deps.pop();
    let result = func(...getVals(deps));
    if (result == _undefined)
      return [];
    let binding = { _deps: deps, dom: toDom(result), func };
    for (let s of deps)
      if (protoOf(s ?? 0) === stateProto) {
        statesToGc = addAndScheduleOnFirst(
          statesToGc,
          s,
          () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
          bindingGcCycleInMs
        );
        s.bindings.push(binding);
      }
    return binding.dom;
  };
  var van_default = { add, tags: tagsNS(), "tagsNS": tagsNS, state, bind };

  // van.forbundle.js
  window.van = van_default;
})();
