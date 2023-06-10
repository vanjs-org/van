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
  var checkStateValValid = (v) => {
    expect(!(v instanceof Node), "DOM Node is not valid value for state");
    expect(protoOf2(v ?? 0) !== stateProto2, "State couldn't have value to other state");
    return v;
  };
  var state2 = (initVal) => new Proxy(van_default.state(Object.freeze(checkStateValValid(initVal))), {
    set: (s, prop, val2) => {
      if (prop === "val")
        Object.freeze(checkStateValValid(val2));
      return Reflect.set(s, prop, val2);
    },
    get: (s, prop) => {
      if (prop === "onnew")
        return (l) => {
          expect(typeof l === "function", "You should pass-in functions to register `onnew` handlers");
          s.onnew(l);
        };
      return Reflect.get(s, prop);
    }
  });
  var isValidPrimitive = (v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "bigint";
  var isDomOrPrimitive = (v) => v instanceof Node || isValidPrimitive(v);
  var checkChildValid = (child) => {
    expect(
      isDomOrPrimitive(child) || child === null || child === void 0 || protoOf2(child ?? 0) === stateProto2 && (isValidPrimitive(child.val) || child.val === null || child.val === void 0),
      "Only DOM Node, string, number, boolean, bigint, null, undefined and state of string, number, boolean, bigint, null or undefined are valid child of a DOM Node"
    );
    expect(!child?.isConnected, "You can't add a DOM Node that is already connected to document");
  };
  var add2 = (dom, ...children) => {
    expect(dom instanceof Node, "1st argument of `add` function must be a DOM Node object");
    for (const child of children.flat(Infinity))
      checkChildValid(child);
    return van_default.add(dom, ...children);
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
          if (protoOf2(v ?? 0) === stateProto2) {
            debugProps[k] = { deps: [v], f: (v2) => validatePropValue(v2) };
          } else if (protoOf2(v ?? 0) === Object.prototype) {
            expect(
              Array.isArray(v.deps),
              "For state-derived properties, you want specify an Array in `deps` field"
            );
            expect(
              typeof v.f === "function",
              "For state-derived properties, you want specify the generation function in `f` field"
            );
            debugProps[k] = { deps: v.deps, f: (...deps) => validatePropValue(v.f(...deps)) };
          } else
            debugProps[k] = validatePropValue(v);
        }
        for (const child of children.flat(Infinity))
          checkChildValid(child);
        return vanTag(debugProps, ...children);
      };
    }
  });
  var tagsNS2 = (ns) => {
    expect(typeof ns === "string", "Must provide a string for parameter `ns` in `tagsNS`");
    return _tagsNS(ns);
  };
  var bind2 = (...deps) => {
    let func = deps.pop();
    expect(deps.length > 0, "`bind` must be called with 1 or more states as dependencies");
    expect(typeof func === "function", "The last argument of `bind` must be the generation function");
    return van_default.bind(...deps, (...depArgs) => {
      const result = func(...depArgs);
      if (!expect(
        result === null || result === void 0 || isDomOrPrimitive(result),
        "The result of `bind` generation function must be DOM node, primitive, null or undefined"
      ))
        return null;
      if (depArgs.length > deps.length) {
        const prevResult = depArgs[deps.length];
        if (!expect(
          prevResult instanceof Node && prevResult.isConnected,
          "The previous result of the `bind` generation function must be a DOM node connected to document"
        ))
          return null;
        if (result !== prevResult && result instanceof Node)
          expect(
            !result.isConnected,
            "If the result of `bind` generation fucntion is not the same as previous one, it shouldn't be already connected to document"
          );
      }
      return result;
    });
  };
  var van_debug_default = { add: add2, tags: _tagsNS(), tagsNS: tagsNS2, state: state2, bind: bind2, startCapturingErrors, stopCapturingErrors, get capturedErrors() {
    return capturedErrors;
  } };

  // van.forbundle.debug.js
  window.van = van_debug_default;
})();
