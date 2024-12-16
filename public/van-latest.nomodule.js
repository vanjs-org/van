(() => {
  // van.js
  var object = Object;
  var protoOf = object.getPrototypeOf;
  var changedStates;
  var derivedStates;
  var curDeps;
  var curNewDerives;
  var alwaysConnectedDom = { isConnected: 1 };
  var gcCycleInMs = 1e3;
  var statesToGc;
  var propSetterCache = {};
  var objProto = protoOf(alwaysConnectedDom);
  var funcProto = protoOf(protoOf);
  var _undefined;
  var remove = "remove";
  var evl = "eventListener";
  var st = Set;
  var dc = document;
  var addAndScheduleOnFirst = (set, s, f, waitMs) => (set ?? (setTimeout(f, waitMs), new st())).add(s);
  var runAndCaptureDeps = (f, deps, arg) => {
    let prevDeps = curDeps;
    curDeps = deps;
    try {
      return f(arg);
    } catch (e) {
      console.error(e);
      return arg;
    } finally {
      curDeps = prevDeps;
    }
  };
  var keepConnected = (l) => l.filter((b) => b._dom?.isConnected);
  var addStatesToGc = (d) => statesToGc = addAndScheduleOnFirst(statesToGc, d, () => {
    for (let s of statesToGc)
      s._bindings = keepConnected(s._bindings), s._listeners = keepConnected(s._listeners);
    statesToGc = _undefined;
  }, gcCycleInMs);
  var stateProto = {
    get val() {
      curDeps?._getters?.add(this);
      return this.rawVal;
    },
    get oldVal() {
      curDeps?._getters?.add(this);
      return this._oldVal;
    },
    set val(v) {
      curDeps?._setters?.add(this);
      if (v !== this.rawVal) {
        this.rawVal = v;
        this._bindings.length + this._listeners.length ? (derivedStates?.add(this), changedStates = addAndScheduleOnFirst(changedStates, this, updateDoms)) : this._oldVal = v;
      }
    }
  };
  var state = (initVal) => ({
    __proto__: stateProto,
    rawVal: initVal,
    _oldVal: initVal,
    _bindings: [],
    _listeners: []
  });
  var bind = (f, dom) => {
    let deps = { _getters: new st(), _setters: new st() }, binding = { f }, prevNewDerives = curNewDerives;
    curNewDerives = [];
    let newDom = runAndCaptureDeps(f, deps, dom);
    newDom = (newDom ?? dc).nodeType ? newDom : new Text(newDom);
    for (let d of deps._getters)
      deps._setters.has(d) || (addStatesToGc(d), d._bindings.push(binding));
    for (let l of curNewDerives)
      l._dom = newDom;
    curNewDerives = prevNewDerives;
    return binding._dom = newDom;
  };
  var derive = (f, s = state(), dom) => {
    let deps = { _getters: new st(), _setters: new st() }, listener = { f, s };
    listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom;
    s.val = runAndCaptureDeps(f, deps, s.rawVal);
    for (let d of deps._getters)
      deps._setters.has(d) || (addStatesToGc(d), d._listeners.push(listener));
    return s;
  };
  var add = (dom, ...children) => {
    for (let c of children.flat(1 / 0)) {
      let protoOfC = protoOf(c ?? 0);
      let child = protoOfC === stateProto ? bind(() => c.val) : protoOfC === funcProto ? bind(c) : c;
      child != _undefined && dom.append(child);
    }
    return dom;
  };
  var tag = (ns, name, ...args) => {
    let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = dc["createElement" + ns && "NS"](ns || name, name);
    for (let [k, v] of object.entries(props)) {
      let getPropDescriptor = (proto) => proto ? object.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) : _undefined;
      let cacheKey = name + "," + k;
      let propSetter = propSetterCache[cacheKey] ??= getPropDescriptor(protoOf(dom))?.set ?? 0;
      let on = k.startsWith("on"), setter = on ? (v2, oldV) => {
        let event = k.slice(2);
        dom[remove + evl](event, oldV);
        dom["add" + evl](event, v2);
      } : propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k);
      let protoOfV = protoOf(v ?? 0);
      on || protoOfV === funcProto && (v = derive(v), protoOfV = stateProto);
      protoOfV === stateProto ? bind(() => (setter(v.val, v._oldVal), dom)) : setter(v);
    }
    return add(dom, children);
  };
  var handler = (ns) => ({ get: (_, name) => tag.bind(_undefined, ns, name) });
  var update = (dom, newDom) => newDom === dom || dom[newDom ? "replaceWith" : remove](newDom);
  var updateDoms = () => {
    let iter = 0, derivedStatesArray = [...changedStates].filter((s) => s.rawVal !== s._oldVal);
    do {
      derivedStates = new st();
      for (let l of new st(derivedStatesArray.flatMap((s) => s._listeners = keepConnected(s._listeners))))
        derive(l.f, l.s, l._dom), l._dom = _undefined;
    } while (++iter < 100 && (derivedStatesArray = [...derivedStates]).length);
    let changedStatesArray = [...changedStates].filter((s) => s.rawVal !== s._oldVal);
    changedStates = _undefined;
    for (let b of new st(changedStatesArray.flatMap((s) => s._bindings = keepConnected(s._bindings))))
      update(b._dom, bind(b.f, b._dom)), b._dom = _undefined;
    for (let s of changedStatesArray)
      s._oldVal = s.rawVal;
  };
  var van_default = {
    tags: new Proxy((ns) => new Proxy(tag, handler(ns)), handler()),
    hydrate: (dom, f) => update(dom, bind(f, dom)),
    add,
    state,
    derive
  };

  // van.forbundle.js
  window.van = van_default;
})();
