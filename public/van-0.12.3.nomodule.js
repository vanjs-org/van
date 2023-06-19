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
  var isState = (s) => protoOf(s ?? 0) === stateProto;
  var val = (s) => isState(s) ? s._val : s;
  var vals = (deps) => deps.map(val);
  var oldVals = (deps) => deps.map((s) => isState(s) ? s.oldVal : s);
  var toDom = (v) => v.nodeType ? v : new Text(v);
  var add = (dom, ...children) => {
    for (let child of children.flat(Infinity))
      if (val(child) != _undefined)
        dom.appendChild(protoOf(child) === stateProto ? bind(child, (v) => v) : toDom(child));
    return dom;
  };
  var isPropSettableCache = {};
  var tagsNS = (ns) => new Proxy((name, ...args) => {
    let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = ns ? doc.createElementNS(ns, name) : doc.createElement(name);
    for (let [k, v] of Obj.entries(props)) {
      let getPropDescriptor = (proto) => proto ? Obj.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) : _undefined;
      let cacheKey = name + "," + k;
      let isPropSettable = isPropSettableCache[cacheKey] ?? (isPropSettableCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0);
      let setter = isPropSettable ? (v2) => dom[k] = v2 : (v2) => dom.setAttribute(k, v2);
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
  var updateDoms = () => {
    let changedStatesArray = [...changedStates];
    changedStates = _undefined;
    for (let b of new Set(changedStatesArray.flatMap(filterBindings))) {
      let { _deps, dom } = b;
      let newDom = b.func(...vals(_deps), dom, ...oldVals(_deps));
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
    let func = deps.pop(), result = func(...vals(deps));
    if (result != _undefined) {
      let binding = { _deps: deps, dom: toDom(result), func };
      for (let s of deps)
        if (isState(s)) {
          statesToGc = addAndScheduleOnFirst(
            statesToGc,
            s,
            () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
            bindingGcCycleInMs
          );
          s.bindings.push(binding);
        }
      return binding.dom;
    }
  };
  var van_default = { add, tags: tagsNS(), "tagsNS": tagsNS, state, bind };

  // van.forbundle.js
  window.van = van_default;
})();
