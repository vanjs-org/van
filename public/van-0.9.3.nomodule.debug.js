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
  var doc = document;
  var Obj = Object;
  var Null = null;
  var changedStates;
  var enqueueState = (s) => changedStates = (changedStates ?? (setTimeout(updateDoms), /* @__PURE__ */ new Set())).add(s);
  var State = class {
    constructor(v) {
      this._val = v;
      this.bindings = [];
      this.derivedStateSetters = [];
    }
    get "val"() {
      return this._val;
    }
    set "val"(v) {
      let s = this;
      if (v !== s._val) {
        if (!s.oldVal) {
          enqueueState(s);
          s.oldVal = s._val;
        } else if (v === s.oldVal) {
          s.oldVal = Null;
          changedStates.delete(s);
        }
        s._val = v;
        s.derivedStateSetters.forEach((d) => d());
      }
    }
  };
  var state = (initVal) => new State(initVal);
  var toDom = (input) => input instanceof Node ? input : input instanceof State ? bind(input, (v) => doc.createTextNode(v)) : doc.createTextNode(input);
  var add = (dom, ...children) => children.flat(Infinity).forEach((child) => dom.appendChild(toDom(child)));
  var tags = new Proxy((name, ...args) => {
    let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args];
    let dom = doc.createElement(name);
    Obj.entries(props).forEach(([k, v]) => {
      if (v)
        if (k.startsWith("on"))
          dom[k] = v;
        else if (v instanceof State)
          bind(v, (v2) => (dom[k] = v2, dom));
        else
          dom.setAttribute(k, v);
    });
    add(dom, ...children);
    return dom;
  }, { get: (tag, name) => tag.bind(Null, name) });
  var updateDoms = () => {
    let changedStatesArray = [...changedStates];
    changedStates = Null;
    new Set(changedStatesArray.flatMap(
      (s) => s.bindings = s.bindings.filter((b) => b.dom?.isConnected)
    )).forEach((b) => {
      let { dom, deps, func } = b;
      let newDom = func(...deps.map((d) => d._val), dom, ...deps.map((d) => d.oldVal));
      if (newDom !== dom) {
        if (newDom)
          dom.replaceWith(newDom);
        else
          dom.remove();
        b.dom = newDom;
      }
    });
    changedStatesArray.forEach((s) => s.oldVal = Null);
  };
  var bind = (...args) => {
    let deps = args.slice(0, -1), func = args[args.length - 1];
    let result = func(...deps.map((d) => d._val));
    if (result instanceof Node) {
      let binding = { deps, dom: result, func };
      deps.forEach((d) => d.bindings.push(binding));
      return result;
    }
    let resultState = state(result);
    let setter = () => resultState.val = func(
      ...deps.map((d) => d._val),
      resultState._val,
      ...deps.map((d) => d.oldVal)
    );
    deps.forEach((d) => d.derivedStateSetters.push(setter));
    return resultState;
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
  var State2 = state().constructor;
  var checkStateValValid = (v) => {
    expect(!(v instanceof Node), "DOM Node is not valid value for state");
    expect(!(v instanceof State2), "State couldn't have value to other state");
  };
  var state2 = (initVal) => {
    checkStateValValid(initVal);
    return new Proxy(state(initVal), {
      set: (s, name, val) => {
        if (name === "val") {
          checkStateValValid(val);
          s.val = val;
        } else
          s[name] = val;
        return true;
      }
    });
  };
  var isValidPrimitive = (v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "bigint";
  var checkChildValid = (child) => {
    expect(
      child instanceof Node || isValidPrimitive(child) || child instanceof State2 && isValidPrimitive(child.val),
      "Only DOM Node, string, number, boolean, bigint, and state of string, number, boolean or bigint are valid child of a DOM Node"
    );
    expect(!child.isConnected, "You can't add a DOM Node that is already connected to a DOM document");
  };
  var add2 = (dom, ...children) => {
    expect(dom instanceof Node, "1st argument of `add` function must be a DOM Node object");
    children.flat(Infinity).forEach((child) => checkChildValid(child));
    add(dom, ...children);
  };
  var tags2 = new Proxy(tags, {
    get: (vanTags, name) => {
      const vanTag = vanTags[name];
      return (...args) => {
        let [props, ...children] = args[0]?.constructor === Object ? args : [{}, ...args];
        for (const [k, v] of Object.entries(props)) {
          if (k.startsWith("on"))
            expect(typeof v === "function", "Value for on... handler must be of function type");
          else {
            expect(
              isValidPrimitive(v) || v instanceof State2 && isValidPrimitive(v.val),
              "Only string, number, boolean, bigint, and state of string, number, boolean or bigint are valid prop value types"
            );
            if (v instanceof State2)
              expect(k !== "class", "When prop value is a state, we set the value on DOM Node properties directly. Thus you probably want to use `classList` instead of `class` here");
            else
              expect(k !== "classList", "When prop value is a primitive type, we set the value via setAttribute instead of setting via DOM Node properties. Thus you probably want to use `class` instead of `classList` here");
          }
        }
        children.flat(Infinity).forEach((child) => checkChildValid(child));
        return vanTag(...args);
      };
    }
  });
  var bind2 = (...args) => {
    const deps = args.slice(0, -1), func = args[args.length - 1];
    expect(deps.length > 0, "`bind` must be called with 1 or more states as dependencies");
    deps.forEach((d) => expect(d instanceof State2, "Dependencies in `bind` must be states"));
    expect(typeof func === "function", "The last argument of `bind` must be the generation function");
    const result = func(...deps.map((d) => d.val));
    expect(result !== null && result !== void 0, "The initial result of `bind` generation function can't be null or undefined");
    expect(!(result instanceof State2), "The result of `bind` generation function can't be a state object");
    return bind(...deps, (...genArgs) => {
      const result2 = func(...genArgs);
      expect(!(result2 instanceof State2), "The result of `bind` generation function can't be a state object");
      if (genArgs.length > deps.length) {
        const prevResult = genArgs[deps.length];
        if (prevResult instanceof Node) {
          expect(prevResult.isConnected, "For binding to DOM Node, the previous result of generation function must be connected to a DOM document");
          if (!expect(
            result2 instanceof Node || !result2,
            "For binding to DOM Node, the result of generation function must be also a DOM object, null, or undefined"
          ))
            return null;
          if (result2 && result2 !== prevResult) {
            if (!expect(
              !result2.isConnected,
              "For binding to DOM Node, if the result of generation function is not the same as previous one, it shouldn't be already connected to a DOM document"
            ))
              return null;
          }
        } else {
          expect(
            result2 !== null && result2 !== void 0,
            "For binding to derived state, the result of generation function can't be null or undefined"
          );
          expect(
            !(result2 instanceof Node),
            "For binding to derived state, the result of generation function can't be a DOM object"
          );
        }
      }
      return result2;
    });
  };

  // van.forbundle.debug.js
  window.van = van_debug_exports;
})();
