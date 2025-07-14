(() => {
  // van.js
  var protoOf = Object.getPrototypeOf;
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
    let deps = { _getters: /* @__PURE__ */ new Set(), _setters: /* @__PURE__ */ new Set() }, binding = { f }, prevNewDerives = curNewDerives;
    curNewDerives = [];
    let newDom = runAndCaptureDeps(f, deps, dom);
    newDom = (newDom ?? document).nodeType ? newDom : new Text(newDom);
    for (let d of deps._getters)
      deps._setters.has(d) || (addStatesToGc(d), d._bindings.push(binding));
    for (let l of curNewDerives)
      l._dom = newDom;
    curNewDerives = prevNewDerives;
    return binding._dom = newDom;
  };
  var derive = (f, s = state(), dom) => {
    let deps = { _getters: /* @__PURE__ */ new Set(), _setters: /* @__PURE__ */ new Set() }, listener = { f, s };
    listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom;
    s.val = runAndCaptureDeps(f, deps, s.rawVal);
    for (let d of deps._getters)
      deps._setters.has(d) || (addStatesToGc(d), d._listeners.push(listener));
    return s;
  };
  var add = (dom, ...children) => {
    for (let c of children.flat(Infinity)) {
      let protoOfC = protoOf(c ?? 0);
      let child = protoOfC === stateProto ? bind(() => c.val) : protoOfC === funcProto ? bind(c) : c;
      child != _undefined && dom.append(child);
    }
    return dom;
  };
  var tag = (ns, name, ...args) => {
    let [{ is, ...props }, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = ns ? document.createElementNS(ns, name, { is }) : document.createElement(name, { is });
    for (let [k, v] of Object.entries(props)) {
      let getPropDescriptor = (proto) => proto ? Object.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) : _undefined;
      let cacheKey = name + "," + k;
      let propSetter = propSetterCache[cacheKey] ??= getPropDescriptor(protoOf(dom))?.set ?? 0;
      let setter = k.startsWith("on") ? (v2, oldV) => {
        let event = k.slice(2);
        dom.removeEventListener(event, oldV);
        dom.addEventListener(event, v2);
      } : propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k);
      let protoOfV = protoOf(v ?? 0);
      k.startsWith("on") || protoOfV === funcProto && (v = derive(v), protoOfV = stateProto);
      protoOfV === stateProto ? bind(() => (setter(v.val, v._oldVal), dom)) : setter(v);
    }
    return add(dom, children);
  };
  var handler = (ns) => ({ get: (_, name) => tag.bind(_undefined, ns, name) });
  var update = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove();
  var updateDoms = () => {
    let iter = 0, derivedStatesArray = [...changedStates].filter((s) => s.rawVal !== s._oldVal);
    do {
      derivedStates = /* @__PURE__ */ new Set();
      for (let l of new Set(derivedStatesArray.flatMap((s) => s._listeners = keepConnected(s._listeners))))
        derive(l.f, l.s, l._dom), l._dom = _undefined;
    } while (++iter < 100 && (derivedStatesArray = [...derivedStates]).length);
    let changedStatesArray = [...changedStates].filter((s) => s.rawVal !== s._oldVal);
    changedStates = _undefined;
    for (let b of new Set(changedStatesArray.flatMap((s) => s._bindings = keepConnected(s._bindings))))
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
  var isState = (s) => protoOf2(s ?? 0) === stateProto2;
  var checkStateValValid = (v) => {
    expect(!isState(v), "State couldn't have value to other state");
    expect(!(v instanceof Node), "DOM Node is not valid value for state");
    return v;
  };
  var state2 = (initVal) => {
    const proxy = new Proxy(van_default.state(checkStateValValid(initVal)), {
      set: (s, prop, val) => {
        prop === "val" && checkStateValValid(val);
        return Reflect.set(s, prop, val, proxy);
      }
    });
    return proxy;
  };
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
    if (isState(c))
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
  var debugHandler = {
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
          if (isState(v))
            debugProps[k] = van_default.derive(() => validatePropValue(v.val));
          else if (typeof v === "function" && (!k.startsWith("on") || v._isBindingFunc))
            debugProps[k] = van_default.derive(() => validatePropValue(v()));
          else
            debugProps[k] = validatePropValue(v);
        }
        return vanTag(debugProps, ...checkChildren(children));
      };
    }
  };
  var _tagsNS = (ns) => new Proxy(van_default.tags(ns), debugHandler);
  var tagsNS = (ns) => {
    expect(typeof ns === "string", "Must provide a string for parameter `ns` in `van.tags`");
    return _tagsNS(ns);
  };
  var _tags = _tagsNS("");
  var tags = new Proxy(tagsNS, { get: (_, name) => _tags[name] });
  var hydrate = (dom, f) => {
    expect(dom instanceof Node, "1st argument of `van.hydrate` function must be a DOM Node object");
    expect(typeof f === "function", "2nd argument of `van.hydrate` function must be a function");
    return van_default.hydrate(dom, withResultValidation(f));
  };
  var van_debug_default = { add: add2, tags, state: state2, derive: derive2, hydrate, startCapturingErrors, stopCapturingErrors, get capturedErrors() {
    return capturedErrors;
  } };

  // van.forbundle.debug.js
  window.van = van_debug_default;
})();
