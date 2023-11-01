(() => {
  // van.js
  var Obj = Object;
  var _undefined;
  var protoOf = Obj.getPrototypeOf;
  var doc = document;
  var changedStates;
  var curDeps;
  var curNewDerives;
  var alwaysConnectedDom = { isConnected: 1 };
  var gcCycleInMs = 1e3;
  var statesToGc;
  var propSetterCache = {};
  var objProto = protoOf(alwaysConnectedDom);
  var funcProto = protoOf(protoOf);
  var addAndScheduleOnFirst = (set, s, f, waitMs) => (set ?? (setTimeout(f, waitMs), /* @__PURE__ */ new Set())).add(s);
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
      curDeps?.add(this);
      return this._val;
    },
    get oldVal() {
      curDeps?.add(this);
      return this._oldVal;
    },
    set val(v) {
      let s = this;
      if (v !== s._val) {
        s._val = v;
        let listeners = [...s._listeners = keepConnected(s._listeners)];
        for (let l of listeners)
          derive(l.f, l.s, l._dom), l._dom = _undefined;
        s._bindings.length ? changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms) : s._oldVal = v;
      }
    }
  };
  var state = (initVal) => ({
    __proto__: stateProto,
    _val: initVal,
    _oldVal: initVal,
    _bindings: [],
    _listeners: []
  });
  var isState = (s) => protoOf(s ?? 0) === stateProto;
  var val = (s) => isState(s) ? s.val : s;
  var oldVal = (s) => isState(s) ? s.oldVal : s;
  var bind = (f, dom) => {
    let deps = /* @__PURE__ */ new Set(), binding = { f }, prevNewDerives = curNewDerives;
    curNewDerives = [];
    let newDom = runAndCaptureDeps(f, deps, dom);
    newDom = (newDom ?? doc).nodeType ? newDom : new Text(newDom);
    for (let d of deps)
      addStatesToGc(d), d._bindings.push(binding);
    for (let l of curNewDerives)
      l._dom = newDom;
    curNewDerives = prevNewDerives;
    return binding._dom = newDom;
  };
  var derive = (f, s = state(), dom) => {
    let deps = /* @__PURE__ */ new Set(), listener = { f, s };
    listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom;
    s.val = runAndCaptureDeps(f, deps);
    for (let d of deps)
      addStatesToGc(d), d._listeners.push(listener);
    return s;
  };
  var add = (dom, ...children) => {
    for (let c of children.flat(Infinity)) {
      let protoOfC = protoOf(c ?? 0);
      let child = protoOfC === stateProto ? bind(() => c.val) : protoOfC === funcProto ? bind(c) : c;
      if (child != _undefined)
        dom.append(child);
    }
    return dom;
  };
  var _ = (f) => (f._isBindingFunc = 1, f);
  var tagsNS = (ns) => new Proxy((name, ...args) => {
    let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = ns ? doc.createElementNS(ns, name) : doc.createElement(name);
    for (let [k, v] of Obj.entries(props)) {
      let getPropDescriptor = (proto) => proto ? Obj.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) : _undefined;
      let cacheKey = name + "," + k;
      let propSetter = propSetterCache[cacheKey] ?? (propSetterCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0);
      let setter = propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k);
      let protoOfV = protoOf(v ?? 0);
      if (protoOfV === stateProto)
        bind(() => (setter(v.val), dom));
      else if (protoOfV === funcProto && (!k.startsWith("on") || v._isBindingFunc))
        bind(() => (setter(v()), dom));
      else
        setter(v);
    }
    return add(dom, ...children);
  }, { get: (tag, name) => tag.bind(_undefined, name) });
  var update = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove();
  var updateDoms = () => {
    let changedStatesArray = [...changedStates].filter((s) => s._val !== s._oldVal);
    changedStates = _undefined;
    for (let b of new Set(changedStatesArray.flatMap((s) => s._bindings = keepConnected(s._bindings))))
      update(b._dom, bind(b.f, b._dom)), b._dom = _undefined;
    for (let s of changedStatesArray)
      s._oldVal = s._val;
  };
  var hydrate = (dom, f) => update(dom, bind(f, dom));
  var van_default = { add, _, tags: tagsNS(), tagsNS, state, val, oldVal, derive, hydrate };

  // van.debug.js
  var capturedErrors;
  var startCapturingErrors = () => capturedErrors = [];
  var stopCapturingErrors = () => capturedErrors = null;
  var expect = (cond, msg) => {
    if (!cond) {
      if (capturedErrors)
        capturedErrors.push(msg);
      else
        throw new Error(msg);
      return false;
    }
    return true;
  };
  var protoOf2 = Object.getPrototypeOf;
  var stateProto2 = protoOf2(van_default.state());
  var isState2 = (s) => protoOf2(s ?? 0) === stateProto2;
  var checkStateValValid = (v) => {
    expect(!isState2(v), "State couldn't have value to other state");
    expect(!(v instanceof Node), "DOM Node is not valid value for state");
    return v;
  };
  var state2 = (initVal) => new Proxy(van_default.state(checkStateValValid(initVal)), {
    set: (s, prop, val2) => (prop === "val" && checkStateValValid(val2), Reflect.set(s, prop, val2))
  });
  var derive2 = (f) => {
    expect(typeof f === "function", "Must pass-in a function to `van.derive`");
    return van_default.derive(f);
  };
  var isValidPrimitive = (v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "bigint";
  var isDomOrPrimitive = (v) => v instanceof Node || isValidPrimitive(v);
  var validateChild = (child) => {
    expect(
      isDomOrPrimitive(child) || child === null || child === void 0,
      "Only DOM Node, string, number, boolean, bigint, null, undefined are valid child of a DOM Element"
    );
    return child;
  };
  var withResultValidation = (f) => (dom) => {
    const r = validateChild(f(dom));
    if (r !== dom && r instanceof Node)
      expect(
        !r.isConnected,
        "If the result of complex binding function is not the same as previous one, it shouldn't be already connected to document"
      );
    return r;
  };
  var checkChildren = (children) => children.flat(Infinity).map((c) => {
    if (isState2(c))
      return withResultValidation(() => c.val);
    if (typeof c === "function")
      return withResultValidation(c);
    expect(!c?.isConnected, "You can't add a DOM Node that is already connected to document");
    return validateChild(c);
  });
  var add2 = (dom, ...children) => {
    expect(dom instanceof Element, "1st argument of `van.add` function must be a DOM Element object");
    return van_default.add(dom, ...checkChildren(children));
  };
  var _2 = (f) => {
    expect(typeof f === "function", "Must pass-in a function to `van._`");
    return van_default._(f);
  };
  var _tagsNS = (ns) => new Proxy(van_default.tagsNS(ns), {
    get: (vanTags, name) => {
      const vanTag = vanTags[name];
      return (...args) => {
        const [props, ...children] = protoOf2(args[0] ?? 0) === Object.prototype ? args : [{}, ...args];
        const debugProps = {};
        for (const [k, v] of Object.entries(props)) {
          const validatePropValue = k.startsWith("on") ? k.toLowerCase() === k ? (v2) => (expect(
            typeof v2 === "function" || v2 === null,
            `Invalid property value for ${k}: Only functions and null are allowed for ${k} property`
          ), v2) : (v2) => (expect(
            typeof v2 === "string",
            `Invalid property value for ${k}: Only strings are allowed for ${k} attribute`
          ), v2) : (v2) => (expect(
            isValidPrimitive(v2) || v2 === null,
            `Invalid property value for ${k}: Only string, number, boolean, bigint and null are valid prop value types`
          ), v2);
          if (isState2(v))
            debugProps[k] = van_default._(() => validatePropValue(v.val));
          else if (typeof v === "function" && (!k.startsWith("on") || v._isBindingFunc))
            debugProps[k] = van_default._(() => validatePropValue(v()));
          else
            debugProps[k] = validatePropValue(v);
        }
        return vanTag(debugProps, ...checkChildren(children));
      };
    }
  });
  var tagsNS2 = (ns) => {
    expect(typeof ns === "string", "Must provide a string for parameter `ns` in `van.tagsNS`");
    return _tagsNS(ns);
  };
  var hydrate2 = (dom, f) => {
    expect(dom instanceof Node, "1st argument of `van.hydrate` function must be a DOM Node object");
    expect(typeof f === "function", "2nd argument of `van.hydrate` function must be a function");
    return van_default.hydrate(dom, withResultValidation(f));
  };
  var van_debug_default = { add: add2, _: _2, tags: _tagsNS(), tagsNS: tagsNS2, state: state2, val: van_default.val, oldVal: van_default.oldVal, derive: derive2, hydrate: hydrate2, startCapturingErrors, stopCapturingErrors, get capturedErrors() {
    return capturedErrors;
  } };

  // van.forbundle.debug.js
  window.van = van_debug_default;
})();
