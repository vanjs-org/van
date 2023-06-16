(() => {
  // van.js
  var Obj = Object;
  var _undefined;
  var protoOf = Obj.getPrototypeOf;
  var doc = document;
  var addAndScheduleOnFirst = (set, s, func, waitMs) => (set ?? (setTimeout(func, waitMs), /* @__PURE__ */ new Set())).add(s);
  var changedStates;
  var getValHook;
  var runWithGetValHook = (f, hook, arg) => {
    let prevGetValHook = getValHook;
    getValHook = hook;
    let r = f(arg);
    getValHook = prevGetValHook;
    return r;
  };
  var stateProto = {
    get "val"() {
      getValHook?.(this);
      return this._val;
    },
    get "oldVal"() {
      getValHook?.(this);
      return this._oldVal;
    },
    set "val"(v) {
      let s = this, curV = s._val;
      if (v !== curV) {
        changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms);
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
    _oldVal: initVal,
    bindings: [],
    listeners: []
  });
  var isState = (s) => protoOf(s ?? 0) === stateProto;
  var val = (s) => isState(s) ? s.val : s;
  var oldVal = (s) => isState(s) ? s.oldVal : s;
  var toDom = (v) => v.nodeType ? v : new Text(v);
  var bindingGcCycleInMs = 1e3;
  var statesToGc;
  var filterBindings = (s) => s.bindings = s.bindings.filter((b) => b.dom?.isConnected);
  var bind = (f, arg) => {
    const binding = { f };
    return binding.dom = toDom(runWithGetValHook(f, (s) => {
      statesToGc = addAndScheduleOnFirst(
        statesToGc,
        s,
        () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
        bindingGcCycleInMs
      );
      s.bindings.push(binding);
    }, arg));
  };
  var add = (dom, ...children) => {
    for (let child of children.flat(Infinity))
      if (val(child) != _undefined)
        dom.appendChild(isState(child) ? bind(() => child.val) : toDom(child));
    return dom;
  };
  var propSetterCache = {};
  var tagsNS = (ns) => new Proxy((name, ...args) => {
    let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = ns ? doc.createElementNS(ns, name) : doc.createElement(name);
    for (let [k, v] of Obj.entries(props)) {
      let getPropDescriptor = (proto) => proto ? Obj.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) : _undefined;
      let cacheKey = name + "," + k;
      let propSetter = propSetterCache[cacheKey] ?? (propSetterCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0);
      let setter = propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k);
      if (isState(v))
        bind(() => (setter(v.val), dom));
      else if (!k.startsWith("on") && typeof v === "function")
        bind(() => (setter(v()), dom));
      else
        setter(v);
    }
    return add(dom, ...children);
  }, { get: (tag, name) => tag.bind(_undefined, name) });
  var updateDoms = () => {
    let changedStatesArray = [...changedStates].filter((s) => s._val !== s._oldVal);
    changedStates = _undefined;
    for (let b of new Set(changedStatesArray.flatMap(filterBindings))) {
      let dom = b.dom, newDom = bind(b.f, dom);
      b.dom = _undefined;
      if (newDom !== dom)
        newDom != _undefined ? dom.replaceWith(newDom) : dom.remove();
    }
    for (let s of changedStatesArray)
      s._oldVal = s._val;
  };
  var van_default = { add, tags: tagsNS(), "tagsNS": tagsNS, state, val, oldVal };

  // van.forbundle.js
  window.van = van_default;
})();
