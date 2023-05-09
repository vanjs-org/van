(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // van.debug.js
  var van_debug_exports = {};
  __export(van_debug_exports, {
    add: () => add2,
    bind: () => bind2,
    capturedErrors: () => capturedErrors,
    startCapturingErrors: () => startCapturingErrors,
    state: () => state2,
    stopCapturingErrors: () => stopCapturingErrors,
    tags: () => tags2
  });

  // van.js
  var Obj = Object;
  var Null = null;
  var addAndScheduleOnFirst = (set, s, func, waitMs) => (set ?? (setTimeout(func, waitMs), /* @__PURE__ */ new Set())).add(s);
  var changedStates;
  var State = class {
    constructor(v) {
      let s = this;
      s._val = s.oldVal = v;
      s.bindings = [];
      s.listeners = [];
    }
    get "val"() {
      return this._val;
    }
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
    }
    "onnew"(l) {
      this.listeners.push(l);
    }
  };
  var state = (initVal) => new State(initVal);
  var toDom = (v) => v.nodeType ? v : new Text(v);
  var add = (dom, ...children) => children.flat(Infinity).forEach((child) => dom.appendChild(
    child instanceof State ? bind(child, (v) => v) : toDom(child)
  ));
  var tags = new Proxy((name, ...args) => {
    let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args];
    let dom = document.createElement(name);
    Obj.entries(props).forEach(([k, v]) => {
      let setter = dom[k] !== void 0 ? (v2) => dom[k] = v2 : (v2) => dom.setAttribute(k, v2);
      if (v instanceof State)
        bind(v, (v2) => (setter(v2), dom));
      else if (v.constructor === Obj)
        bind(...v["deps"], (...deps) => (setter(v["f"](...deps)), dom));
      else
        setter(v);
    });
    add(dom, ...children);
    return dom;
  }, { get: (tag, name) => tag.bind(Null, name) });
  var filterBindings = (s) => s.bindings = s.bindings.filter((b) => b.dom?.isConnected);
  var updateDoms = () => {
    let changedStatesArray = [...changedStates];
    changedStates = Null;
    new Set(changedStatesArray.flatMap(filterBindings)).forEach((b) => {
      let { _deps, dom, func } = b;
      let newDom = func(..._deps.map((d) => d._val), dom, ..._deps.map((d) => d.oldVal));
      if (newDom !== dom)
        if (newDom !== Null)
          dom.replaceWith(b.dom = toDom(newDom));
        else
          dom.remove(), b.dom = Null;
    });
    changedStatesArray.forEach((s) => s.oldVal = s._val);
  };
  var bindingGcCycleInMs = 1e3;
  var statesToGc;
  var bind = (...args) => {
    let deps = args.slice(0, -1), func = args[args.length - 1];
    let result = func(...deps.map((d) => d._val));
    if (result === Null)
      return [];
    let binding = { _deps: deps, dom: toDom(result), func };
    deps.forEach((s) => {
      statesToGc = addAndScheduleOnFirst(
        statesToGc,
        s,
        () => (statesToGc.forEach(filterBindings), statesToGc = Null),
        bindingGcCycleInMs
      );
      s.bindings.push(binding);
    });
    return binding.dom;
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
  var checkStateValValid = (v) => {
    expect(!(v instanceof Node), "DOM Node is not valid value for state");
    expect(!(v instanceof State2), "State couldn't have value to other state");
  };
  var State2 = class extends state().constructor {
    constructor(v) {
      checkStateValValid(v);
      super(v);
    }
    get val() {
      return super.val;
    }
    set val(v) {
      checkStateValValid(v);
      super.val = v;
    }
    onnew(l) {
      expect(typeof l === "function", "You should pass-in functions to register `onnew` handlers");
      super.onnew(l);
    }
  };
  var state2 = (initVal) => new State2(initVal);
  var isValidPrimitive = (v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "bigint";
  var isDomOrPrimitive = (v) => v instanceof Node || isValidPrimitive(v);
  var checkChildValid = (child) => {
    expect(
      isDomOrPrimitive(child) || child instanceof State2 && isValidPrimitive(child.val),
      "Only DOM Node, string, number, boolean, bigint, and state of string, number, boolean or bigint are valid child of a DOM Node"
    );
    expect(!child.isConnected, "You can't add a DOM Node that is already connected to document");
  };
  var add2 = (dom, ...children) => {
    expect(dom instanceof Node, "1st argument of `add` function must be a DOM Node object");
    children.flat(Infinity).forEach((child) => checkChildValid(child));
    add(dom, ...children);
  };
  var tags2 = new Proxy(
    tags,
    {
      get: (vanTags, name) => {
        const vanTag = vanTags[name];
        return (...args) => {
          let [props, ...children] = args[0]?.constructor === Object ? args : [{}, ...args];
          const debugProps = {};
          for (const [k, v] of Object.entries(props)) {
            const validatePropValue = k.startsWith("on") ? (v2) => expect(
              typeof v2 === "function",
              `Invalid property value for ${k}: Only functions are allowed for on... handler`
            ) : (v2) => expect(
              isValidPrimitive(v2),
              `Invalid property value for ${k}: Only string, number, boolean, bigint are valid prop value types`
            );
            if (v instanceof State2) {
              debugProps[k] = { deps: [v], f: (v2) => (validatePropValue(v2), v2) };
            } else if (v?.constructor === Object) {
              expect(
                Array.isArray(v.deps) && v.deps.every((d) => d instanceof State2),
                "For state-derived properties, you want specify an Array of states in `deps` field"
              );
              expect(
                typeof v.f === "function",
                "For state-derived properties, you want specify the generation function in `f` field"
              );
              debugProps[k] = { deps: v.deps, f: (...deps) => {
                const result = v.f(...deps);
                validatePropValue(result);
                return result;
              } };
            } else {
              validatePropValue(v);
              debugProps[k] = v;
            }
          }
          children.flat(Infinity).forEach((child) => checkChildValid(child));
          return vanTag(debugProps, ...children);
        };
      }
    }
  );
  var bind2 = (...args) => {
    const deps = args.slice(0, -1), func = args[args.length - 1];
    expect(deps.length > 0, "`bind` must be called with 1 or more states as dependencies");
    deps.forEach((d) => expect(d instanceof State2, "Dependencies in `bind` must be states"));
    expect(typeof func === "function", "The last argument of `bind` must be the generation function");
    return bind(...deps, (...depArgs) => {
      const result = func(...depArgs);
      if (!expect(result === null || isDomOrPrimitive(result), "The result of `bind` generation function must be DOM node, primitive or null"))
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

  // van.forbundle.debug.js
  window.van = van_debug_exports;
})();
