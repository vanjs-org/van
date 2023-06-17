(() => {
  // van.js
  var Obj = Object;
  var _undefined;
  var protoOf = Obj.getPrototypeOf;
  var doc = document;
  var addAndScheduleOnFirst = (set, s, func, waitMs) => (set ?? (setTimeout(func, waitMs), /* @__PURE__ */ new Set())).add(s);
  var changedStates;
  var curDeps;
  var runAndCaptureDeps = (f, deps, arg) => {
    let prevDeps = curDeps;
    curDeps = deps;
    let r = f(arg);
    curDeps = prevDeps;
    return r;
  };
  var stateProto = {
    get "val"() {
      curDeps?.add(this);
      return this._val;
    },
    get "oldVal"() {
      curDeps?.add(this);
      return this._oldVal;
    },
    set "val"(v) {
      let s = this, curV = s._val;
      if (v !== curV) {
        changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms);
        s._val = v;
        let listeners = [...s.listeners = s.listeners.filter((l) => !l.executed)];
        for (let l of listeners)
          effect(l.f), l.executed = 1;
      }
    }
  };
  var objProto = protoOf(stateProto);
  var funcProto = protoOf(runAndCaptureDeps);
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
  var toDom = (v) => v == _undefined ? _undefined : v.nodeType ? v : new Text(v);
  var bindingGcCycleInMs = 1e3;
  var statesToGc;
  var filterBindings = (s) => s.bindings = s.bindings.filter((b) => b.dom?.isConnected);
  var bind = (f, dom) => {
    let deps = /* @__PURE__ */ new Set(), binding = { f, dom: toDom(runAndCaptureDeps(f, deps, dom)) };
    for (let s of deps) {
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
  var effect = (f) => {
    let deps = /* @__PURE__ */ new Set(), listener = { f };
    runAndCaptureDeps(f, deps);
    for (let s of deps)
      s.listeners.push(listener);
  };
  var add = (dom, ...children) => {
    for (let c of children.flat(Infinity)) {
      let child = isState(c) ? bind(() => c.val) : protoOf(c ?? 0) === funcProto ? bind(c) : toDom(c);
      if (child != _undefined)
        dom.appendChild(child);
    }
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
      else if (!k.startsWith("on") && protoOf(v ?? 0) === funcProto)
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
  var van_default = { add, tags: tagsNS(), "tagsNS": tagsNS, state, val, oldVal, effect };

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
    expect(!(v instanceof Node), "DOM Node is not valid value for state");
    expect(!isState2(v), "State couldn't have value to other state");
    return v;
  };
  var state2 = (initVal) => new Proxy(van_default.state(Object.freeze(checkStateValValid(initVal))), {
    set: (s, prop, val2) => {
      if (prop === "val")
        Object.freeze(checkStateValValid(val2));
      return Reflect.set(s, prop, val2);
    },
    get: (s, prop) => {
      return Reflect.get(s, prop);
    }
  });
  var effect2 = (f) => {
    expect(typeof f === "function", "Must pass-in a function to `van.effect`");
    van_default.effect(f);
  };
  var isValidPrimitive = (v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "bigint";
  var isDomOrPrimitive = (v) => v instanceof Node || isValidPrimitive(v);
  var checkChildValid = (child) => {
    expect(
      isDomOrPrimitive(child) || child === null || child === void 0 || isState2(child) && (isValidPrimitive(child.val) || child.val === null || child.val === void 0),
      "Only DOM Node, string, number, boolean, bigint, null, undefined and state of string, number, boolean, bigint, null or undefined are valid child of a DOM Node"
    );
    expect(!child?.isConnected, "You can't add a DOM Node that is already connected to document");
  };
  var checkChildren = (children) => children.flat(Infinity).map((c) => {
    if (typeof c === "function")
      return (dom) => {
        const r = c(dom);
        if (!expect(
          r === null || r === void 0 || isDomOrPrimitive(r),
          "The result of `bind` generation function must be DOM node, primitive, null or undefined"
        ))
          return null;
        if (r !== dom && r instanceof Node)
          expect(
            !r.isConnected,
            "If the result of complex binding function is not the same as previous one, it shouldn't be already connected to .document"
          );
        return r;
      };
    checkChildValid(c);
    return c;
  });
  var add2 = (dom, ...children) => {
    expect(dom instanceof Element, "1st argument of `van.add` function must be a DOM Element object");
    return van_default.add(dom, ...checkChildren(children));
  };
  var _tagsNS = (ns) => new Proxy(van_default.tagsNS(ns), {
    get: (vanTags, name) => {
      const vanTag = vanTags[name];
      return (...args) => {
        const [props, ...children] = protoOf2(args[0] ?? 0) === Object.prototype ? args : [{}, ...args];
        const debugProps = {};
        for (const [k, v] of Object.entries(props)) {
          const validatePropValue = k.startsWith("on") ? (v2) => (expect(
            typeof v2 === "function",
            `Invalid property value for ${k}: Only functions are allowed for on... handler`
          ), v2) : (v2) => (expect(
            isValidPrimitive(v2),
            `Invalid property value for ${k}: Only string, number, boolean, bigint are valid prop value types`
          ), v2);
          if (k.startsWith("on")) {
            validatePropValue(van_default.val(v));
            debugProps[k] = v;
          } else if (isState2(v))
            debugProps[k] = () => validatePropValue(v.val);
          else if (typeof v === "function")
            debugProps[k] = () => validatePropValue(v());
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
  var van_debug_default = { add: add2, tags: _tagsNS(), tagsNS: tagsNS2, state: state2, val: van_default.val, oldVal: van_default.oldVal, effect: effect2, startCapturingErrors, stopCapturingErrors, get capturedErrors() {
    return capturedErrors;
  } };

  // van.forbundle.debug.js
  window.van = van_debug_default;
})();
