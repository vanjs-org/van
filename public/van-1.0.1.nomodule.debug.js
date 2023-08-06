(() => {
  // van.js
  var Obj = Object;
  var _undefined;
  var protoOf = Obj.getPrototypeOf;
  var doc = document;
  var addAndScheduleOnFirst = (set, s, f, waitMs) => (set ?? (setTimeout(f, waitMs), /* @__PURE__ */ new Set())).add(s);
  var changedStates;
  var curDeps;
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
  var filterBindings = (s) => s._bindings = s._bindings.filter((b) => b._dom?.isConnected);
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
        let boundStates = /* @__PURE__ */ new Set();
        for (let l of [...s._listeners])
          derive(l.f, l.s), l._executed = 1, l._deps.forEach(boundStates.add, boundStates);
        for (let _s of boundStates)
          _s._listeners = _s._listeners.filter((l) => !l._executed);
        s._bindings.length ? changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms) : s._oldVal = v;
      }
    }
  };
  var objProto = protoOf(stateProto);
  var funcProto = protoOf(runAndCaptureDeps);
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
  var gcCycleInMs = 1e3;
  var statesToGc;
  var bind = (f, dom) => {
    let deps = /* @__PURE__ */ new Set(), binding = { f }, newDom = runAndCaptureDeps(f, deps, dom);
    for (let d of deps) {
      statesToGc = addAndScheduleOnFirst(
        statesToGc,
        d,
        () => (statesToGc.forEach(filterBindings), statesToGc = _undefined),
        gcCycleInMs
      );
      d._bindings.push(binding);
    }
    return binding._dom = (newDom ?? doc).nodeType ? newDom : new Text(newDom);
  };
  var derive = (f, s = state()) => {
    let deps = /* @__PURE__ */ new Set(), listener = { f, _deps: deps, s };
    s.val = runAndCaptureDeps(f, deps);
    for (let d of deps)
      d._listeners.push(listener);
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
      else if (protoOf(v ?? 0) === funcProto && (!k.startsWith("on") || v._isBindingFunc))
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
      let dom = b._dom, newDom = bind(b.f, dom);
      b._dom = _undefined;
      if (newDom !== dom)
        newDom != _undefined ? dom.replaceWith(newDom) : dom.remove();
    }
    for (let s of changedStatesArray)
      s._oldVal = s._val;
  };
  var van_default = { add, _, tags: tagsNS(), tagsNS, state, val, oldVal, derive };

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
  var checkStateValValid = (v) => (expect(!isState2(v), "State couldn't have value to other state"), expect(!(v instanceof Node), "DOM Node is not valid value for state"), v);
  var curBindingFuncId = 0;
  var nextBindingFuncId = 0;
  var runAndSetBindingFuncId = (f, arg) => {
    const prevBindingFuncId = curBindingFuncId;
    curBindingFuncId = ++nextBindingFuncId;
    try {
      return f(arg);
    } finally {
      curBindingFuncId = prevBindingFuncId;
    }
  };
  var inDeriveFunc = false;
  var stateWithCreatedIn = (s) => (s._createdIn = curBindingFuncId, s);
  var state2 = (initVal) => new Proxy(
    stateWithCreatedIn(van_default.state(Object.freeze(checkStateValValid(initVal)))),
    {
      set: (s, prop, val2) => {
        if (prop === "val")
          Object.freeze(checkStateValValid(val2));
        return Reflect.set(s, prop, val2);
      },
      get: (s, prop) => {
        if (inDeriveFunc && (prop === "val" || prop === "oldVal"))
          expect(curBindingFuncId === s._createdIn, "In `van.derive`, accessing a state created outside the scope of current binding function could lead to GC issues");
        return Reflect.get(s, prop);
      }
    }
  );
  var derive2 = (f) => (expect(typeof f === "function", "Must pass-in a function to `van.derive`"), van_default.derive(() => {
    const prevInDeriveFunc = inDeriveFunc;
    inDeriveFunc = true;
    try {
      return f();
    } finally {
      inDeriveFunc = prevInDeriveFunc;
    }
  }));
  var isValidPrimitive = (v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "bigint";
  var isDomOrPrimitive = (v) => v instanceof Node || isValidPrimitive(v);
  var validateChild = (child) => {
    expect(
      isDomOrPrimitive(child) || child === null || child === void 0,
      "Only DOM Node, string, number, boolean, bigint, null, undefined are valid child of a DOM Element"
    );
    return child;
  };
  var checkChildren = (children) => children.flat(Infinity).map((c) => {
    const withResultValidation = (f) => (dom) => {
      const r = validateChild(f(dom));
      if (r !== dom && r instanceof Node)
        expect(
          !r.isConnected,
          "If the result of complex binding function is not the same as previous one, it shouldn't be already connected to document"
        );
      return r;
    };
    if (isState2(c))
      return withResultValidation(() => c.val);
    if (typeof c === "function")
      return withResultValidation((dom) => runAndSetBindingFuncId(c, dom));
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
          const validatePropValue = k.startsWith("on") ? (v2) => (expect(
            typeof v2 === "function" || v2 === null,
            `Invalid property value for ${k}: Only functions and null are allowed for on... handler`
          ), v2) : (v2) => (expect(
            isValidPrimitive(v2) || v2 === null,
            `Invalid property value for ${k}: Only string, number, boolean, bigint and null are valid prop value types`
          ), v2);
          if (isState2(v))
            debugProps[k] = van_default._(() => validatePropValue(v.val));
          else if (typeof v === "function" && (!k.startsWith("on") || v._isBindingFunc))
            debugProps[k] = van_default._(() => validatePropValue(runAndSetBindingFuncId(v)));
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
  var van_debug_default = { add: add2, _: _2, tags: _tagsNS(), tagsNS: tagsNS2, state: state2, val: van_default.val, oldVal: van_default.oldVal, derive: derive2, startCapturingErrors, stopCapturingErrors, get capturedErrors() {
    return capturedErrors;
  } };

  // van.forbundle.debug.js
  window.van = van_debug_default;
})();
