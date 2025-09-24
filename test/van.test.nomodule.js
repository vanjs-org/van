'use strict';
(() => {
  // ../test/van.test.js
  window.numTests = 0;
  var runTests = async (van2, msgDom2, { debug }) => {
    const { a, b, button, div: div2, h2: h22, i, input, li, option, p, pre, select, span, sup, table, tbody, td, th, thead, tr, ul } = van2.tags;
    const assert = (cond) => {
      if (!cond)
        throw new Error("Assertion failed");
    };
    const assertEq = (lhs, rhs) => {
      if (lhs !== rhs)
        throw new Error(`Assertion failed. Expected equal. Actual lhs: ${lhs}, rhs: ${rhs}.`);
    };
    const assertBetween = (n, start, end) => {
      if (!(n >= start && n < end))
        throw new Error(`Assertion failed. Expected in range [${start}, ${end}). Actual: ${n}.`);
    };
    const assertError = (msg, func) => {
      let caught = false;
      try {
        func();
      } catch (e) {
        if (msg instanceof RegExp) {
          if (msg.test(e.toString()))
            caught = true;
          else
            throw e;
        } else {
          if (e.toString().includes(msg))
            caught = true;
          else
            throw e;
        }
      }
      if (!caught)
        throw new Error(`Expected error with message "${msg}" being thrown.`);
    };
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const withHiddenDom = (func) => async () => {
      const dom = div2({ class: "hidden" });
      van2.add(document.body, dom);
      try {
        await func(dom);
      } finally {
        dom.remove();
      }
    };
    const capturingErrors = async (msg, numErrors, func) => {
      van2.startCapturingErrors();
      try {
        await func();
        assert(van2.capturedErrors.length === numErrors && van2.capturedErrors.every((e) => msg instanceof RegExp ? msg.test(e.toString()) : e.toString().includes(msg)));
      } finally {
        van2.stopCapturingErrors();
      }
    };
    const tests = {
      tags_basic: () => {
        const dom = div2(p("\u{1F44B}Hello"), ul(li("\u{1F5FA}\uFE0FWorld"), li(a({ href: "https://vanjs.org/" }, "\u{1F366}VanJS"))));
        assertEq(dom.outerHTML, '<div><p>\u{1F44B}Hello</p><ul><li>\u{1F5FA}\uFE0FWorld</li><li><a href="https://vanjs.org/">\u{1F366}VanJS</a></li></ul></div>');
      },
      tags_onclickHandler: () => {
        const dom = div2(button({ onclick: () => van2.add(dom, p("Button clicked!")) }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
      },
      tags_escape: () => {
        assertEq(p("<input>").outerHTML, "<p>&lt;input&gt;</p>");
        assertEq(div2("a && b").outerHTML, "<div>a &amp;&amp; b</div>");
        assertEq(div2("<input a && b>").outerHTML, "<div>&lt;input a &amp;&amp; b&gt;</div>");
      },
      tags_nestedChildren: () => {
        assertEq(ul([li("Item 1"), li("Item 2"), li("Item 3")]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
        assertEq(ul([[li("Item 1"), [li("Item 2")]], li("Item 3")]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
      },
      tags_nullOrUndefinedAreIgnored: () => {
        assertEq(ul(li("Item 1"), li("Item 2"), void 0, li("Item 3"), null).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
        assertEq(ul([li("Item 1"), li("Item 2"), void 0, li("Item 3"), null]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
        assertEq(ul([[void 0, li("Item 1"), null, [li("Item 2")]], null, li("Item 3"), void 0]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
      },
      tags_nullPropValue: () => {
        {
          const dom = button({ onclick: null });
          assert(dom.onclick === null);
        }
        {
          const dom = div2({ id: null });
          assertEq(dom.outerHTML, '<div id="null"></div>');
        }
      },
      tags_undefinedPropValue_excludeDebug: () => {
        const dom = div2({ id: void 0 });
        assertEq(dom.outerHTML, '<div id="undefined"></div>');
      },
      tags_stateAsProp_connected: withHiddenDom(async (hiddenDom) => {
        const href = van2.state("http://example.com/");
        const dom = a({ href }, "Test Link");
        van2.add(hiddenDom, dom);
        assertEq(dom.href, "http://example.com/");
        href.val = "https://vanjs.org/";
        await Promise.resolve();
        assertEq(dom.href, "https://vanjs.org/");
      }),
      tags_stateAsProp_disconnected: async () => {
        const href = van2.state("http://example.com/");
        const dom = a({ href }, "Test Link");
        assertEq(dom.href, "http://example.com/");
        href.val = "https://vanjs.org/";
        await Promise.resolve();
        assertEq(dom.href, "http://example.com/");
      },
      tags_stateAsOnclickHandler_connected: withHiddenDom(async (hiddenDom) => {
        const dom = div2();
        van2.add(hiddenDom, dom);
        const handler = van2.state(() => van2.add(dom, p("Button clicked!")));
        van2.add(dom, button({ onclick: handler }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        handler.val = () => van2.add(dom, div2("Button clicked!"));
        await Promise.resolve();
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>");
        handler.val = null;
        await Promise.resolve();
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>");
      }),
      tags_stateAsOnclickHandler_disconnected: async () => {
        const dom = div2();
        const handler = van2.state(() => van2.add(dom, p("Button clicked!")));
        van2.add(dom, button({ onclick: handler }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        handler.val = () => van2.add(dom, div2("Button clicked!"));
        await Promise.resolve();
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><p>Button clicked!</p></div>");
      },
      tags_stateDerivedProp_connected: withHiddenDom(async (hiddenDom) => {
        const host = van2.state("example.com");
        const path2 = van2.state("/hello");
        const dom = a({ href: () => `https://${host.val}${path2.val}` }, "Test Link");
        van2.add(hiddenDom, dom);
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        path2.val = "/start";
        await Promise.resolve();
        assertEq(dom.href, "https://vanjs.org/start");
      }),
      tags_stateDerivedProp_disconnected: async () => {
        const host = van2.state("example.com");
        const path2 = van2.state("/hello");
        const dom = a({ href: () => `https://${host.val}${path2.val}` }, "Test Link");
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        path2.val = "/start";
        await Promise.resolve();
        assertEq(dom.href, "https://example.com/hello");
      },
      tags_stateDerivedProp_nonStateDeps_connected: withHiddenDom(async (hiddenDom) => {
        const host = van2.state("example.com");
        const path2 = "/hello";
        const dom = a({ href: () => `https://${host.val}${path2}` }, "Test Link");
        van2.add(hiddenDom, dom);
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        await Promise.resolve();
        assertEq(dom.href, "https://vanjs.org/hello");
      }),
      tags_stateDerivedProp_nonStateDeps_disconnected: async () => {
        const host = van2.state("example.com");
        const path2 = "/hello";
        const dom = a({ href: () => `https://${host.val}${path2}` }, "Test Link");
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        await Promise.resolve();
        assertEq(dom.href, "https://example.com/hello");
      },
      tags_stateDerivedProp_errorThrown_connected: withHiddenDom(async (hiddenDom) => {
        const text = van2.state("hello");
        const dom = div2(div2({
          class: () => {
            if (text.val === "fail")
              throw new Error();
            return text.val;
          },
          "data-name": text
        }, text), div2({
          class: () => {
            if (text.val === "fail")
              throw new Error();
            return text.val;
          },
          "data-name": text
        }, text));
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, '<div><div class="hello" data-name="hello">hello</div><div class="hello" data-name="hello">hello</div></div>');
        text.val = "fail";
        await Promise.resolve();
        assertEq(dom.outerHTML, '<div><div class="hello" data-name="fail">fail</div><div class="hello" data-name="fail">fail</div></div>');
      }),
      tags_stateDerivedProp_errorThrown_disconnected: async () => {
        const text = van2.state("hello");
        const dom = div2(div2({
          class: () => {
            if (text.val === "fail")
              throw new Error();
            return text.val;
          },
          "data-name": text
        }, text), div2({
          class: () => {
            if (text.val === "fail")
              throw new Error();
            return text.val;
          },
          "data-name": text
        }, text));
        assertEq(dom.outerHTML, '<div><div class="hello" data-name="hello">hello</div><div class="hello" data-name="hello">hello</div></div>');
        text.val = "fail";
        await Promise.resolve();
        assertEq(dom.outerHTML, '<div><div class="hello" data-name="hello">hello</div><div class="hello" data-name="hello">hello</div></div>');
      },
      tags_stateDerivedOnclickHandler_connected: withHiddenDom(async (hiddenDom) => {
        const elementName = van2.state("p");
        van2.add(hiddenDom, button({
          onclick: van2.derive(() => {
            const name = elementName.val;
            return name ? () => van2.add(hiddenDom, van2.tags[name]("Button clicked!")) : null;
          })
        }));
        hiddenDom.querySelector("button").click();
        assertEq(hiddenDom.innerHTML, "<button></button><p>Button clicked!</p>");
        elementName.val = "div";
        await Promise.resolve();
        hiddenDom.querySelector("button").click();
        assertEq(hiddenDom.innerHTML, "<button></button><p>Button clicked!</p><div>Button clicked!</div>");
        elementName.val = "";
        await Promise.resolve();
        hiddenDom.querySelector("button").click();
        assertEq(hiddenDom.innerHTML, "<button></button><p>Button clicked!</p><div>Button clicked!</div>");
      }),
      tags_stateDerivedOnclickHandler_disconnected: async () => {
        const dom = div2();
        const elementName = van2.state("p");
        van2.add(dom, button({
          onclick: van2.derive(() => {
            const name = elementName.val;
            return name ? () => van2.add(dom, van2.tags[name]("Button clicked!")) : null;
          })
        }));
        dom.querySelector("button").click();
        assertEq(dom.innerHTML, "<button></button><p>Button clicked!</p>");
        elementName.val = "div";
        await Promise.resolve();
        dom.querySelector("button").click();
        assertEq(dom.innerHTML, "<button></button><p>Button clicked!</p><p>Button clicked!</p>");
      },
      tags_dataAttributes_connected: withHiddenDom(async (hiddenDom) => {
        const lineNum = van2.state(1);
        const dom = div2({
          "data-type": "line",
          "data-id": lineNum,
          "data-line": () => `line=${lineNum.val}`
        }, "This is a test line");
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
        lineNum.val = 3;
        await Promise.resolve();
        assertEq(dom.outerHTML, '<div data-type="line" data-id="3" data-line="line=3">This is a test line</div>');
      }),
      tags_dataAttributes_disconnected: async () => {
        const lineNum = van2.state(1);
        const dom = div2({
          "data-type": "line",
          "data-id": lineNum,
          "data-line": () => `line=${lineNum.val}`
        }, "This is a test line");
        assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
        lineNum.val = 3;
        await Promise.resolve();
        assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
      },
      tags_readonlyProps_connected: withHiddenDom(async (hiddenDom) => {
        const form = van2.state("form1");
        const dom = button({ form }, "Button");
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        form.val = "form2";
        await Promise.resolve();
        assertEq(dom.outerHTML, '<button form="form2">Button</button>');
        assertEq(input({ list: "datalist1" }).outerHTML, '<input list="datalist1">');
      }),
      tags_readonlyProps_disconnected: async () => {
        const form = van2.state("form1");
        const dom = button({ form }, "Button");
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        form.val = "form2";
        await Promise.resolve();
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        assertEq(input({ list: "datalist1" }).outerHTML, '<input list="datalist1">');
      },
      tags_customEventHandler: () => {
        const dom = div2(button({ oncustom: () => van2.add(dom, p("Event triggered!")) }));
        dom.querySelector("button").dispatchEvent(new Event("custom"));
        assertEq(dom.innerHTML, "<button></button><p>Event triggered!</p>");
      },
      tags_stateAsCustomEventHandler: withHiddenDom(async (hiddenDom) => {
        const oncustom = van2.state(() => van2.add(hiddenDom, p("Handler 1 triggered!")));
        van2.add(hiddenDom, button({ oncustom }));
        hiddenDom.querySelector("button").dispatchEvent(new Event("custom"));
        assertEq(hiddenDom.innerHTML, "<button></button><p>Handler 1 triggered!</p>");
        oncustom.val = () => van2.add(hiddenDom, p("Handler 2 triggered!"));
        await Promise.resolve();
        hiddenDom.querySelector("button").dispatchEvent(new Event("custom"));
        assertEq(hiddenDom.innerHTML, "<button></button><p>Handler 1 triggered!</p><p>Handler 2 triggered!</p>");
      }),
      tags_stateDerivedCustomEventHandler: withHiddenDom(async (hiddenDom) => {
        const handlerType = van2.state(1);
        van2.add(hiddenDom, button({
          oncustom: van2.derive(() => handlerType.val === 1 ? () => van2.add(hiddenDom, p("Handler 1 triggered!")) : () => van2.add(hiddenDom, p("Handler 2 triggered!")))
        }));
        hiddenDom.querySelector("button").dispatchEvent(new Event("custom"));
        assertEq(hiddenDom.innerHTML, "<button></button><p>Handler 1 triggered!</p>");
        handlerType.val = 2;
        await Promise.resolve();
        hiddenDom.querySelector("button").dispatchEvent(new Event("custom"));
        assertEq(hiddenDom.innerHTML, "<button></button><p>Handler 1 triggered!</p><p>Handler 2 triggered!</p>");
      }),
      tags_stateAsChild_connected: withHiddenDom(async (hiddenDom) => {
        const line2 = van2.state("Line 2");
        const dom = div2(pre("Line 1"), pre(line2), pre("Line 3"));
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = "Line 2: Extra Stuff";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2: Extra Stuff</pre><pre>Line 3</pre></div>");
        line2.val = null;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>");
        line2.val = "Line 2";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>");
      }),
      tags_stateAsChild_disconnected: async () => {
        const line2 = van2.state("Line 2");
        const dom = div2(pre("Line 1"), pre(line2), pre("Line 3"));
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = "Line 2: Extra Stuff";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = null;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
      },
      tags_stateAsChild_emptyStrWontDeleteDom: withHiddenDom(async (hiddenDom) => {
        const text = van2.state("Text");
        const dom = p(text);
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<p>Text</p>");
        text.val = "";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<p></p>");
        text.val = "Text";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<p>Text</p>");
      }),
      tags_svg: () => {
        const { circle, path: path2, svg } = van2.tags("http://www.w3.org/2000/svg");
        const dom = svg({ width: "16px", viewBox: "0 0 50 50" }, circle({ cx: "25", cy: "25", "r": "20", stroke: "black", "stroke-width": "2", fill: "yellow" }), circle({ cx: "16", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black" }), circle({ cx: "34", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black" }), path2({ "d": "M 15 30 Q 25 40, 35 30", stroke: "black", "stroke-width": "2", fill: "transparent" }));
        assertEq(dom.outerHTML, '<svg width="16px" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" stroke="black" stroke-width="2" fill="yellow"></circle><circle cx="16" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><circle cx="34" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><path d="M 15 30 Q 25 40, 35 30" stroke="black" stroke-width="2" fill="transparent"></path></svg>');
      },
      tags_math: () => {
        const { math, mi, mn, mo, mrow, msup } = van2.tags("http://www.w3.org/1998/Math/MathML");
        const dom = math(msup(mi("e"), mrow(mi("i"), mi("\u03C0"))), mo("+"), mn("1"), mo("="), mn("0"));
        assertEq(dom.outerHTML, "<math><msup><mi>e</mi><mrow><mi>i</mi><mi>\u03C0</mi></mrow></msup><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn></math>");
      },
      tags_isOption: withHiddenDom(async (hiddenDom) => {
        class MyButton extends HTMLButtonElement {
          connectedCallback() {
            this.addEventListener("click", () => this.textContent = "MyButton clicked!");
          }
        }
        const tagName = "my-button-" + window.numTests;
        customElements.define(tagName, MyButton, { extends: "button" });
        van2.add(hiddenDom, button({ class: "myButton", is: tagName }, "Test Button"));
        const buttonDom = hiddenDom.querySelector("button");
        buttonDom.click();
        await Promise.resolve();
        assertEq(buttonDom.textContent, "MyButton clicked!");
        assert(buttonDom.className === "myButton");
      }),
      tags_isOption_ns: withHiddenDom(async (hiddenDom) => {
        class MyButton extends HTMLButtonElement {
          connectedCallback() {
            this.addEventListener("click", () => this.textContent = "MyButton clicked!");
          }
        }
        const tagName = "my-button-" + window.numTests;
        customElements.define(tagName, MyButton, { extends: "button" });
        const { button: button2 } = van2.tags("http://www.w3.org/1999/xhtml");
        van2.add(hiddenDom, button2({ class: "myButton", is: tagName }, "Test Button"));
        const buttonDom = hiddenDom.querySelector("button");
        buttonDom.click();
        await Promise.resolve();
        assertEq(buttonDom.textContent, "MyButton clicked!");
        assert(buttonDom.className === "myButton");
      }),
      add_basic: () => {
        const dom = ul();
        assertEq(van2.add(dom, li("Item 1"), li("Item 2")), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li></ul>");
        assertEq(van2.add(dom, li("Item 3"), li("Item 4"), li("Item 5")), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
        assertEq(van2.add(dom), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
      },
      add_nestedChildren: () => {
        const dom = ul();
        assertEq(van2.add(dom, [li("Item 1"), li("Item 2")]), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li></ul>");
        assertEq(van2.add(dom, [[li("Item 3"), [li("Item 4")]], li("Item 5")]), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
        assertEq(van2.add(dom, [[[]]]), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
      },
      add_nullOrUndefinedAreIgnored: () => {
        const dom = ul();
        assertEq(van2.add(dom, li("Item 1"), li("Item 2"), void 0, li("Item 3"), null), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
        assertEq(van2.add(dom, [li("Item 4"), li("Item 5"), void 0, li("Item 6"), null]), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>");
        assertEq(van2.add(dom, [[void 0, li("Item 7"), null, [li("Item 8")]], null, li("Item 9"), void 0]), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li><li>Item 7</li><li>Item 8</li><li>Item 9</li></ul>");
      },
      add_addState_connected: withHiddenDom(async (hiddenDom) => {
        const line2 = van2.state("Line 2");
        assertEq(van2.add(hiddenDom, pre("Line 1"), pre(line2), pre("Line 3")), hiddenDom);
        assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>');
        line2.val = "Line 2: Extra Stuff";
        await Promise.resolve();
        assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre>Line 2: Extra Stuff</pre><pre>Line 3</pre></div>');
        line2.val = null;
        await Promise.resolve();
        assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>');
        line2.val = "Line 2";
        await Promise.resolve();
        assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>');
      }),
      add_addState_disconnected: async () => {
        const line2 = van2.state("Line 2");
        const dom = div2();
        assertEq(van2.add(dom, pre("Line 1"), pre(line2), pre("Line 3")), dom);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = "Line 2: Extra Stuff";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = null;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
      },
      add_toDocumentFragment: () => {
        const dom = div2();
        const fragment = document.createDocumentFragment();
        van2.add(fragment, div2("Line 1"));
        van2.add(fragment, div2("Line 2"));
        dom.append(fragment);
        assertEq(dom.innerHTML, "<div>Line 1</div><div>Line 2</div>");
      },
      state_valAndOldVal: withHiddenDom(async (hiddenDom) => {
        const s = van2.state("State Version 1");
        assertEq(s.val, "State Version 1");
        assertEq(s.oldVal, "State Version 1");
        s.val = "State Version 2";
        assertEq(s.val, "State Version 2");
        assertEq(s.oldVal, "State Version 2");
        van2.add(hiddenDom, s);
        s.val = "State Version 3";
        assertEq(s.val, "State Version 3");
        assertEq(s.oldVal, "State Version 2");
        await Promise.resolve();
        assertEq(s.val, "State Version 3");
        assertEq(s.oldVal, "State Version 3");
      }),
      state_rawVal: withHiddenDom(async (hiddenDom) => {
        const history = [];
        const a2 = van2.state(3), b2 = van2.state(5);
        const s = van2.derive(() => a2.rawVal + b2.val);
        van2.derive(() => history.push(a2.rawVal + b2.val));
        van2.add(hiddenDom, input({ type: "text", value: () => a2.rawVal + b2.val }), p(() => a2.rawVal + b2.val));
        assertEq(s.val, 8);
        assertEq(JSON.stringify(history), "[8]");
        assertEq(hiddenDom.querySelector("input").value, "8");
        assertEq(hiddenDom.querySelector("p").innerText, "8");
        ++a2.val;
        await Promise.resolve();
        assertEq(s.val, 8);
        assertEq(JSON.stringify(history), "[8]");
        assertEq(hiddenDom.querySelector("input").value, "8");
        assertEq(hiddenDom.querySelector("p").innerText, "8");
        ++b2.val;
        await Promise.resolve();
        assertEq(s.val, 10);
        assertEq(JSON.stringify(history), "[8,10]");
        assertEq(hiddenDom.querySelector("input").value, "10");
        assertEq(hiddenDom.querySelector("p").innerText, "10");
      }),
      derive_sideEffect: async () => {
        const history = [];
        const s = van2.state("This");
        van2.derive(() => history.push(s.val));
        assertEq(JSON.stringify(history), '["This"]');
        s.val = "is";
        await Promise.resolve();
        assertEq(JSON.stringify(history), '["This","is"]');
        s.val = "a";
        await Promise.resolve();
        assertEq(JSON.stringify(history), '["This","is","a"]');
        s.val = "test";
        await Promise.resolve();
        assertEq(JSON.stringify(history), '["This","is","a","test"]');
        s.val = "test";
        await Promise.resolve();
        assertEq(JSON.stringify(history), '["This","is","a","test"]');
        s.val = "test2";
        s.val = "test3";
        await Promise.resolve();
        assertEq(JSON.stringify(history), '["This","is","a","test","test3"]');
      },
      derive_derivedState: async () => {
        const numItems = van2.state(0);
        const items = van2.derive(() => [...Array(numItems.val).keys()].map((i2) => `Item ${i2 + 1}`));
        const selectedIndex = van2.derive(() => (items.val, 0));
        const selectedItem = van2.derive(() => items.val[selectedIndex.val]);
        numItems.val = 3;
        await Promise.resolve();
        assertEq(numItems.val, 3);
        assertEq(items.val.join(","), "Item 1,Item 2,Item 3");
        assertEq(selectedIndex.val, 0);
        assertEq(selectedItem.val, "Item 1");
        selectedIndex.val = 2;
        await Promise.resolve();
        assertEq(selectedIndex.val, 2);
        assertEq(selectedItem.val, "Item 3");
        numItems.val = 5;
        await Promise.resolve();
        assertEq(numItems.val, 5);
        assertEq(items.val.join(","), "Item 1,Item 2,Item 3,Item 4,Item 5");
        assertEq(selectedIndex.val, 0);
        assertEq(selectedItem.val, "Item 1");
        selectedIndex.val = 3;
        await Promise.resolve();
        assertEq(selectedIndex.val, 3);
        assertEq(selectedItem.val, "Item 4");
      },
      derive_conditionalDerivedState: async () => {
        const cond = van2.state(true);
        const a2 = van2.state(1), b2 = van2.state(2), c = van2.state(3), d = van2.state(4);
        let numEffectTriggered = 0;
        const sum = van2.derive(() => (++numEffectTriggered, cond.val ? a2.val + b2.val : c.val + d.val));
        assertEq(sum.val, 3);
        assertEq(numEffectTriggered, 1);
        a2.val = 11;
        await Promise.resolve();
        assertEq(sum.val, 13);
        assertEq(numEffectTriggered, 2);
        b2.val = 12;
        await Promise.resolve();
        assertEq(sum.val, 23);
        assertEq(numEffectTriggered, 3);
        c.val = 13;
        await Promise.resolve();
        assertEq(sum.val, 23);
        assertEq(numEffectTriggered, 3);
        d.val = 14;
        await Promise.resolve();
        assertEq(sum.val, 23);
        assertEq(numEffectTriggered, 3);
        cond.val = false;
        await Promise.resolve();
        assertEq(sum.val, 27);
        assertEq(numEffectTriggered, 4);
        c.val = 23;
        await Promise.resolve();
        assertEq(sum.val, 37);
        assertEq(numEffectTriggered, 5);
        d.val = 24;
        await Promise.resolve();
        assertEq(sum.val, 47);
        assertEq(numEffectTriggered, 6);
        a2.val = 21;
        await Promise.resolve();
        assertEq(sum.val, 47);
        assertEq(numEffectTriggered, 6);
        b2.val = 22;
        await Promise.resolve();
        assertEq(sum.val, 47);
        assertEq(numEffectTriggered, 6);
      },
      derive_errorThrown: async () => {
        const s0 = van2.state(1);
        const s1 = van2.derive(() => s0.val * 2);
        const s2 = van2.derive(() => {
          if (s0.val > 1)
            throw new Error();
          return s0.val;
        });
        const s3 = van2.derive(() => s0.val * s0.val);
        assertEq(s1.val, 2);
        assertEq(s2.val, 1);
        assertEq(s3.val, 1);
        s0.val = 3;
        await Promise.resolve();
        assertEq(s1.val, 6);
        assertEq(s2.val, 1);
        assertEq(s3.val, 9);
      },
      derive_selfRef: withHiddenDom(async (hiddenDom) => {
        const CheckboxCounter = () => {
          const checked = van2.state(false), numChecked = van2.state(0);
          van2.derive(() => {
            if (checked.val)
              ++numChecked.val;
          });
          return div2(input({ type: "checkbox", checked, onclick: (e) => checked.val = e.target.checked }), " Checked ", numChecked, " times. ", button({ onclick: () => numChecked.val = 0 }, "Reset"));
        };
        van2.add(hiddenDom, CheckboxCounter());
        assertEq(hiddenDom.innerHTML, '<div><input type="checkbox"> Checked 0 times. <button>Reset</button></div>');
        hiddenDom.querySelector("input").click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<div><input type="checkbox"> Checked 1 times. <button>Reset</button></div>');
        hiddenDom.querySelector("input").click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<div><input type="checkbox"> Checked 1 times. <button>Reset</button></div>');
        hiddenDom.querySelector("input").click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<div><input type="checkbox"> Checked 2 times. <button>Reset</button></div>');
        hiddenDom.querySelector("button").click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<div><input type="checkbox"> Checked 0 times. <button>Reset</button></div>');
      }),
      derive_minimizeDerivations: async () => {
        const a2 = van2.state(3), b2 = van2.state(5);
        let numDerivations = 0;
        const s = van2.derive(() => {
          ++numDerivations;
          return a2.val + b2.val;
        });
        assertEq(s.val, 8);
        assertEq(numDerivations, 1);
        ++a2.val, ++b2.val;
        await Promise.resolve();
        assertEq(s.val, 10);
        assertEq(numDerivations, 2);
        ++a2.val, --a2.val;
        await Promise.resolve();
        assertEq(s.val, 10);
        assertEq(numDerivations, 2);
      },
      derive_multiLayerDerivations: withHiddenDom(async (hiddenDom) => {
        const a2 = van2.state(1), b2 = van2.derive(() => a2.val * a2.val);
        const c = van2.derive(() => b2.val * b2.val), d = van2.derive(() => c.val * c.val);
        let numSDerived = 0, numSSquaredDerived = 0;
        const s = van2.derive(() => {
          ++numSDerived;
          return a2.val + b2.val + c.val + d.val;
        });
        van2.add(hiddenDom, "a = ", a2, " b = ", b2, " c = ", c, " d = ", d, " s = ", s, " s^2 = ", () => {
          ++numSSquaredDerived;
          return s.val * s.val;
        });
        assertEq(hiddenDom.innerHTML, "a = 1 b = 1 c = 1 d = 1 s = 4 s^2 = 16");
        assertEq(numSDerived, 1);
        assertEq(numSSquaredDerived, 1);
        ++a2.val;
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, "a = 2 b = 4 c = 16 d = 256 s = 278 s^2 = 77284");
        assertEq(numSDerived, 5);
        assertEq(numSSquaredDerived, 2);
      }),
      derive_circularDependency: async () => {
        const a2 = van2.state(1), b2 = van2.derive(() => a2.val + 1);
        van2.derive(() => a2.val = b2.val + 1);
        ++a2.val;
        await Promise.resolve();
        assertEq(a2.val, 104);
        assertEq(b2.val, 103);
      },
      stateDerivedChild_dynamicDom: withHiddenDom(async (hiddenDom) => {
        const verticalPlacement = van2.state(false);
        const button1Text = van2.state("Button 1"), button2Text = van2.state("Button 2"), button3Text = van2.state("Button 3");
        const domFunc = () => verticalPlacement.val ? div2(div2(button(button1Text)), div2(button(button2Text)), div2(button(button3Text))) : div2(button(button1Text), button(button2Text), button(button3Text));
        assertEq(van2.add(hiddenDom, domFunc), hiddenDom);
        const dom = hiddenDom.firstChild;
        assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2</button><button>Button 3</button></div>");
        button2Text.val = "Button 2: Extra";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
        verticalPlacement.val = true;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
        assertEq(hiddenDom.firstChild.outerHTML, "<div><div><button>Button 1</button></div><div><button>Button 2: Extra</button></div><div><button>Button 3</button></div></div>");
        button2Text.val = "Button 2: Extra Extra";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
        assertEq(hiddenDom.firstChild.outerHTML, "<div><div><button>Button 1</button></div><div><button>Button 2: Extra Extra</button></div><div><button>Button 3</button></div></div>");
      }),
      stateDerivedChild_conditionalDomFunc: withHiddenDom(async (hiddenDom) => {
        const cond = van2.state(true);
        const button1 = van2.state("Button 1"), button2 = van2.state("Button 2");
        const button3 = van2.state("Button 3"), button4 = van2.state("Button 4");
        let numFuncCalled = 0;
        const domFunc = () => (++numFuncCalled, cond.val ? div2(button(button1.val), button(button2.val)) : div2(button(button3.val), button(button4.val)));
        assertEq(van2.add(hiddenDom, domFunc), hiddenDom);
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1</button><button>Button 2</button></div>");
        assertEq(numFuncCalled, 1);
        button1.val = "Button 1-1";
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1-1</button><button>Button 2</button></div>");
        assertEq(numFuncCalled, 2);
        button2.val = "Button 2-1";
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1-1</button><button>Button 2-1</button></div>");
        assertEq(numFuncCalled, 3);
        button3.val = "Button 3-1";
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1-1</button><button>Button 2-1</button></div>");
        assertEq(numFuncCalled, 3);
        button4.val = "Button 4-1";
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1-1</button><button>Button 2-1</button></div>");
        assertEq(numFuncCalled, 3);
        cond.val = false;
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-1</button><button>Button 4-1</button></div>");
        assertEq(numFuncCalled, 4);
        button3.val = "Button 3-2";
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-2</button><button>Button 4-1</button></div>");
        assertEq(numFuncCalled, 5);
        button4.val = "Button 4-2";
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-2</button><button>Button 4-2</button></div>");
        assertEq(numFuncCalled, 6);
        button1.val = "Button 1-2";
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-2</button><button>Button 4-2</button></div>");
        assertEq(numFuncCalled, 6);
        button1.val = "Button 2-2";
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-2</button><button>Button 4-2</button></div>");
        assertEq(numFuncCalled, 6);
      }),
      stateDerivedChild_statefulDynamicDom: withHiddenDom(async (hiddenDom) => {
        const numItems = van2.state(0);
        const items = van2.derive(() => [...Array(numItems.val).keys()].map((i2) => `Item ${i2 + 1}`));
        const selectedIndex = van2.derive(() => (items.val, 0));
        const domFunc = (dom) => {
          if (dom && items.val === items.oldVal) {
            const itemDoms = dom.childNodes;
            itemDoms[selectedIndex.oldVal].classList.remove("selected");
            itemDoms[selectedIndex.val].classList.add("selected");
            return dom;
          }
          return ul(items.val.map((item, i2) => li({ class: i2 === selectedIndex.val ? "selected" : "" }, item)));
        };
        van2.add(hiddenDom, domFunc);
        numItems.val = 3;
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="selected">Item 1</li><li class="">Item 2</li><li class="">Item 3</li></ul>');
        const rootDom1stIteration = hiddenDom.firstChild;
        selectedIndex.val = 1;
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
        assertEq(hiddenDom.firstChild, rootDom1stIteration);
        numItems.val = 5;
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="selected">Item 1</li><li class="">Item 2</li><li class="">Item 3</li><li class="">Item 4</li><li class="">Item 5</li></ul>');
        assert(hiddenDom.firstChild !== rootDom1stIteration);
        assertEq(rootDom1stIteration.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
        const rootDom2ndIteration = hiddenDom.firstChild;
        selectedIndex.val = 2;
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="">Item 1</li><li class="">Item 2</li><li class="selected">Item 3</li><li class="">Item 4</li><li class="">Item 5</li></ul>');
        assertEq(hiddenDom.firstChild, rootDom2ndIteration);
        assertEq(rootDom1stIteration.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
      }),
      stateDerivedChild_nullToRemoveDom: withHiddenDom(async (hiddenDom) => {
        const line1 = van2.state("Line 1"), line2 = van2.state("Line 2"), line3 = van2.state("Line 3"), line4 = van2.state(""), line5 = van2.state(null);
        const dom = div2(
          () => line1.val === "" ? null : p(line1.val),
          () => line2.val === "" ? null : p(line2.val),
          p(line3),
          // line4 won't appear in the DOM tree as its initial value is null
          () => line4.val === "" ? null : p(line4.val),
          // line5 won't appear in the DOM tree as its initial value is null
          p(line5)
        );
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p><p></p></div>");
        line2.val = "";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
        line2.val = "Line 2";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
        line3.val = null;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
        line3.val = "Line 3";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
      }),
      stateDerivedChild_undefinedToRemoveDom: withHiddenDom(async (hiddenDom) => {
        const line1 = van2.state("Line 1"), line2 = van2.state("Line 2"), line3 = van2.state("Line 3"), line4 = van2.state(""), line5 = van2.state(void 0);
        const dom = div2(
          () => line1.val === "" ? null : p(line1.val),
          () => line2.val === "" ? null : p(line2.val),
          p(line3),
          // line4 won't appear in the DOM tree as its initial value is null
          () => line4.val === "" ? null : p(line4.val),
          // line5 won't appear in the DOM tree as its initial value is null
          p(line5)
        );
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p><p></p></div>");
        line2.val = "";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
        line2.val = "Line 2";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
        line3.val = void 0;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
        line3.val = "Line 3";
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
      }),
      stateDerivedChild_0ToNotRemoveDom: withHiddenDom(async (hiddenDom) => {
        const state1 = van2.state(0), state2 = van2.state(1);
        const dom = div2(state1, () => 1 - state1.val, state2, () => 1 - state2.val);
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div>0110</div>");
        state1.val = 1, state2.val = 0;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div>1001</div>");
      }),
      stateDerivedChild_dynamicPrimitive: withHiddenDom(async (hiddenDom) => {
        const a2 = van2.state(1), b2 = van2.state(2), deleted = van2.state(false);
        const dom = div2(() => deleted.val ? null : a2.val + b2.val);
        assertEq(dom.outerHTML, "<div>3</div>");
        van2.add(hiddenDom, dom);
        a2.val = 6;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div>8</div>");
        b2.val = 5;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div>11</div>");
        deleted.val = true;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div></div>");
        deleted.val = false;
        await Promise.resolve();
        assertEq(dom.outerHTML, "<div></div>");
      }),
      stateDerivedChild_nonStateDeps: withHiddenDom(async (hiddenDom) => {
        const part1 = "\u{1F44B}Hello ", part2 = van2.state("\u{1F5FA}\uFE0FWorld");
        assertEq(van2.add(hiddenDom, () => `${part1}${part2.val}, from: ${part1}${part2.oldVal}`), hiddenDom);
        const dom = hiddenDom.firstChild;
        assertEq(dom.textContent, "\u{1F44B}Hello \u{1F5FA}\uFE0FWorld, from: \u{1F44B}Hello \u{1F5FA}\uFE0FWorld");
        assertEq(hiddenDom.innerHTML, "\u{1F44B}Hello \u{1F5FA}\uFE0FWorld, from: \u{1F44B}Hello \u{1F5FA}\uFE0FWorld");
        part2.val = "\u{1F366}VanJS";
        await Promise.resolve();
        assertEq(dom.textContent, "\u{1F44B}Hello \u{1F5FA}\uFE0FWorld, from: \u{1F44B}Hello \u{1F5FA}\uFE0FWorld");
        assertEq(hiddenDom.innerHTML, "\u{1F44B}Hello \u{1F366}VanJS, from: \u{1F44B}Hello \u{1F5FA}\uFE0FWorld");
      }),
      stateDerivedChild_oldVal: withHiddenDom(async (hiddenDom) => {
        const text = van2.state("Old Text");
        assertEq(van2.add(hiddenDom, () => `From: "${text.oldVal}" to: "${text.val}"`), hiddenDom);
        const dom = hiddenDom.firstChild;
        assertEq(dom.textContent, 'From: "Old Text" to: "Old Text"');
        assertEq(hiddenDom.innerHTML, 'From: "Old Text" to: "Old Text"');
        text.val = "New Text";
        await Promise.resolve();
        assertEq(dom.textContent, 'From: "Old Text" to: "Old Text"');
        assertEq(hiddenDom.innerHTML, 'From: "Old Text" to: "New Text"');
      }),
      stateDerivedChild_errorThrown: withHiddenDom(async (hiddenDom) => {
        const num = van2.state(0);
        assertEq(van2.add(hiddenDom, num, () => {
          if (num.val > 0)
            throw new Error();
          return span("ok");
        }, num), hiddenDom);
        assertEq(hiddenDom.innerHTML, "0<span>ok</span>0");
        num.val = 1;
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, "1<span>ok</span>1");
      }),
      hydrate_normal: withHiddenDom(async (hiddenDom) => {
        const Counter2 = (init) => {
          const counter = van2.state(init);
          return button({ "data-counter": counter, onclick: () => ++counter.val }, () => `Count: ${counter.val}`);
        };
        hiddenDom.innerHTML = Counter2(5).outerHTML;
        hiddenDom.querySelector("button").click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<button data-counter="5">Count: 5</button>');
        van2.hydrate(hiddenDom.querySelector("button"), (dom) => Counter2(Number(dom.getAttribute("data-counter"))));
        hiddenDom.querySelector("button").click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<button data-counter="6">Count: 6</button>');
      }),
      hydrate_nullToRemoveDom: withHiddenDom(async (hiddenDom) => {
        van2.add(hiddenDom, div2());
        van2.hydrate(hiddenDom.querySelector("div"), () => null);
        assertEq(hiddenDom.innerHTML, "");
        van2.add(hiddenDom, div2());
        const s = van2.state(1);
        van2.hydrate(hiddenDom.querySelector("div"), () => s.val === 1 ? pre() : null);
        assertEq(hiddenDom.innerHTML, "<pre></pre>");
        s.val = 2;
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, "");
      }),
      hydrate_undefinedToRemoveDom: withHiddenDom(async (hiddenDom) => {
        van2.add(hiddenDom, div2());
        van2.hydrate(hiddenDom.querySelector("div"), () => void 0);
        assertEq(hiddenDom.innerHTML, "");
        van2.add(hiddenDom, div2());
        const s = van2.state(1);
        van2.hydrate(hiddenDom.querySelector("div"), () => s.val === 1 ? pre() : void 0);
        assertEq(hiddenDom.innerHTML, "<pre></pre>");
        s.val = 2;
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, "");
      }),
      hydrate_0NotToRemoveDom: withHiddenDom(async (hiddenDom) => {
        van2.add(hiddenDom, div2(), div2());
        const s = van2.state(0);
        const [dom1, dom2] = hiddenDom.querySelectorAll("div");
        van2.hydrate(dom1, () => s.val);
        van2.hydrate(dom2, () => 1 - s.val);
        assertEq(hiddenDom.innerHTML, "01");
        s.val = 1;
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, "10");
      })
    };
    const debugTests = {
      tags_invalidProp_nonFuncOnHandler: async () => {
        const counter = van2.state(0);
        assertError("Only functions and null are allowed", () => button({ onclick: ++counter.val }, "Increment"));
        assertError("Only functions and null are allowed", () => button({ onclick: 'alert("hello")' }, "Increment"));
        assertError("Only strings are allowed", () => button({ onClick: () => ++counter.val }, "Increment"));
        await capturingErrors("Only functions and null are allowed", 1, () => button({ onclick: van2.state(++counter.val) }, "Increment"));
        await capturingErrors("Only functions and null are allowed", 1, () => button({ onclick: van2.derive(() => ++counter.val) }, "Increment"));
      },
      tags_invalidProp_nonPrimitiveValue: async () => {
        assertError(/Only.*are valid prop value types/, () => a({ href: {} }));
        assertError(/Only.*are valid prop value types/, () => a({ href: void 0 }));
        await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: van2.state({}) }));
        await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: van2.state(void 0) }));
        await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: van2.state((x) => x * 2) }));
        await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: () => ({}) }));
        await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: () => void 0 }));
        await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: () => (x) => x * 2 }));
      },
      tags_invalidFollowupPropValues_stateAsProp: withHiddenDom(async (hiddenDom) => {
        const href1 = van2.state("https://vanjs.org/");
        const href2 = van2.state("https://vanjs.org/");
        const href3 = van2.state("https://vanjs.org/");
        let numClicks = 0;
        const onclick = van2.state(() => ++numClicks);
        van2.add(hiddenDom, a({ href: href1 }), a({ href: href2 }), a({ href: href3 }), button({ onclick }));
        await capturingErrors(/Only.*are valid prop value types/, 3, async () => {
          href1.val = {};
          href2.val = void 0;
          href3.val = (x) => x * 2;
          await Promise.resolve();
          assert(van2.capturedErrors.length === 3 && van2.capturedErrors.every((e) => /Only.*are valid prop value types/.test(e)));
        });
      }),
      tags_invalidFollowupPropValues_stateDerivedProp: withHiddenDom(async (hiddenDom) => {
        const s = van2.state("https://vanjs.org/"), t2 = van2.state(() => {
        });
        van2.add(hiddenDom, a({ href: () => s.val || {} }), a({ href: () => s.val || void 0 }), a({ href: () => s.val || ((x) => x * 2) }), button({ onclick: van2.derive(() => t2.val || 1) }));
        await capturingErrors(/Only.*are valid prop value types/, 3, async () => {
          s.val = "";
          await Promise.resolve();
        });
        await capturingErrors("Only functions and null are allowed", 1, async () => {
          t2.val = 0;
          await Promise.resolve();
        });
      }),
      tags_invalidChild: async () => {
        assertError(/Only.*are valid child of a DOM Element/, () => div2(div2(), {}, p()));
        await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => div2(div2(), van2.state({}), p()));
        await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => div2(div2(), van2.state((x) => x * 2), p()));
      },
      tags_alreadyConnectedChild: withHiddenDom((hiddenDom) => {
        const dom = p();
        van2.add(hiddenDom, dom);
        assertError("already connected to document", () => div2(p(), dom, p()));
      }),
      tags_invalidNs: () => {
        assertError("Must provide a string", () => van2.tags(1));
        assertError("Must provide a string", () => van2.tags(null));
        assertError("Must provide a string", () => van2.tags(void 0));
        assertError("Must provide a string", () => van2.tags({}));
        assertError("Must provide a string", () => van2.tags((x) => x * 2));
      },
      add_1stArgNotDom: () => {
        assertError("1st argument of `van.add` function must be a DOM Element object", () => van2.add({}, div2()));
      },
      add_invalidChild: async () => {
        const dom = div2();
        assertError(/Only.*are valid child of a DOM Element/, () => van2.add(dom, div2(), {}, p()));
        await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => van2.add(dom, div2(), van2.state({}), p()));
        await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => van2.add(dom, div2(), van2.state((x) => x * 2), p()));
      },
      add_alreadyConnectedChild: withHiddenDom((hiddenDom) => {
        const dom = div2();
        van2.add(hiddenDom, dom);
        assertError("already connected to document", () => van2.add(hiddenDom, dom));
      }),
      state_invalidInitialVal: () => {
        assertError("couldn't have value to other state", () => van2.state(van2.state(0)));
        assertError("DOM Node is not valid value for state", () => van2.state(div2()));
      },
      state_invalidValSet: () => {
        const s = van2.state(0);
        assertError("couldn't have value to other state", () => s.val = van2.state(0));
        assertError("DOM Node is not valid value for state", () => s.val = div2());
      },
      derive_nonFuncArg: () => {
        const a2 = van2.state(0);
        assertError("Must pass-in a function to `van.derive`", () => van2.derive(a2.val * 2));
      },
      stateDerivedChild_invalidInitialResult: async () => {
        await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => div2(() => ({})));
        await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => div2(() => (x) => x * 2));
      },
      stateDerivedChild_invalidFollowupResult: withHiddenDom(async (hiddenDom) => {
        const s = van2.state(1);
        van2.add(hiddenDom, () => s.val || {}, () => s.val || ((x) => x * 2), () => s.val || [div2(), div2()]);
        await capturingErrors(/Only.*are valid child of a DOM Element/, 3, async () => {
          s.val = 0;
          await Promise.resolve();
        });
      }),
      stateDerivedChild_derivedDom_domResultAlreadyConnected: withHiddenDom(async (hiddenDom) => {
        const dom = div2();
        van2.add(hiddenDom, dom);
        const num = van2.state(1);
        van2.add(hiddenDom, (prevDom) => {
          if (num.val === 1)
            return div2();
          if (num.val === 2)
            return prevDom;
          if (num.val === 3)
            return dom;
        });
        num.val = 2;
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, "<div></div><div></div>");
        await capturingErrors("it shouldn't be already connected to document", 1, async () => {
          num.val = 3;
          await Promise.resolve();
        });
      }),
      hydrate_1stArgNotDom: () => {
        assertError("1st argument of `van.hydrate` function must be a DOM Node object", () => van2.hydrate({}, () => div2()));
      },
      hydrate_2ndArgNotFunc: () => {
        assertError("2nd argument of `van.hydrate` function must be a function", () => van2.hydrate(div2(), div2()));
      },
      hydrate_invalidInitialResult: async () => {
        await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => van2.hydrate(div2(), () => ({})));
        await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => van2.hydrate(div2(), () => (x) => x * 2));
      },
      hydrate_invalidFollowupResult: withHiddenDom(async (hiddenDom) => {
        const cond = van2.state(true);
        const dom1 = hiddenDom.appendChild(div2());
        const dom2 = hiddenDom.appendChild(div2());
        const dom3 = hiddenDom.appendChild(div2());
        van2.hydrate(dom1, () => cond.val ? div2() : {});
        van2.hydrate(dom2, () => cond.val ? div2() : (x) => x * 2);
        van2.hydrate(dom3, () => cond.val ? div2() : [div2(), div2()]);
        await capturingErrors(/Only.*are valid child of a DOM Element/, 3, async () => {
          cond.val = false;
          await Promise.resolve();
        });
      }),
      hydrate_domResultAlreadyConnected: withHiddenDom(async (hiddenDom) => {
        const dom1 = hiddenDom.appendChild(div2());
        const dom2 = hiddenDom.appendChild(div2());
        await capturingErrors("it shouldn't be already connected to document", 1, () => van2.hydrate(dom1, () => dom2));
      })
    };
    const stateProto = Object.getPrototypeOf(van2.state());
    const val = (v) => Object.getPrototypeOf(v !== null && v !== void 0 ? v : 0) === stateProto ? v.val : v;
    const Counter = ({ van: van3, id, init = 0, buttonStyle = "\u{1F44D}\u{1F44E}" }) => {
      const { button: button2, div: div3 } = van3.tags;
      const [up, down] = [...val(buttonStyle)];
      const counter = van3.state(init);
      return div3(Object.assign(Object.assign({}, id ? { id } : {}), { "data-counter": counter }), "\u2764\uFE0F ", counter, " ", button2({ onclick: () => ++counter.val }, up), button2({ onclick: () => --counter.val }, down));
    };
    const OptimizedCounter = ({ van: van3, id, init = 0, buttonStyle = "\u{1F44D}\u{1F44E}" }) => {
      const { button: button2, div: div3 } = van3.tags;
      const counter = van3.state(init);
      return div3(Object.assign(Object.assign({}, id ? { id } : {}), { "data-counter": counter }), "\u2764\uFE0F ", counter, " ", button2({ onclick: () => ++counter.val }, () => [...val(buttonStyle)][0]), button2({ onclick: () => --counter.val }, () => [...val(buttonStyle)][1]));
    };
    const hydrateExample = (Counter2) => withHiddenDom(async (hiddenDom) => {
      const counterInit = 5;
      const selectDom = select({ value: "\u{1F446}\u{1F447}" }, option("\u{1F446}\u{1F447}"), option("\u{1F44D}\u{1F44E}"), option("\u{1F53C}\u{1F53D}"), option("\u23EB\u23EC"), option("\u{1F4C8}\u{1F4C9}"));
      const buttonStyle = van2.state(selectDom.value);
      selectDom.oninput = (e) => buttonStyle.val = e.target.value;
      hiddenDom.innerHTML = div2(h22("Basic Counter"), Counter2({ van: van2, init: counterInit }), h22("Styled Counter"), p("Select the button style: ", selectDom), Counter2({ van: van2, init: counterInit, buttonStyle })).innerHTML;
      const clickBtns = async (dom, numUp, numDown) => {
        const [upBtn, downBtn] = [...dom.querySelectorAll("button")];
        for (let i2 = 0; i2 < numUp; ++i2) {
          upBtn.click();
          await Promise.resolve();
        }
        for (let i2 = 0; i2 < numDown; ++i2) {
          downBtn.click();
          await Promise.resolve();
        }
      };
      const counterHTML = (counter, buttonStyle2) => {
        const [up, down] = [...buttonStyle2];
        return div2({ "data-counter": counter }, "\u2764\uFE0F ", counter, " ", button(up), button(down)).innerHTML;
      };
      let [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
      await clickBtns(basicCounter, 3, 1);
      await clickBtns(styledCounter, 2, 5);
      [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
      assertEq(basicCounter.innerHTML, counterHTML(5, "\u{1F44D}\u{1F44E}"));
      assertEq(styledCounter.innerHTML, counterHTML(5, "\u{1F446}\u{1F447}"));
      selectDom.value = "\u{1F53C}\u{1F53D}";
      selectDom.dispatchEvent(new Event("input"));
      await Promise.resolve();
      [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
      assertEq(styledCounter.innerHTML, counterHTML(5, "\u{1F446}\u{1F447}"));
      selectDom.value = "\u{1F446}\u{1F447}";
      selectDom.dispatchEvent(new Event("input"));
      van2.hydrate(basicCounter, (dom) => Counter2({
        van: van2,
        id: "basic-counter",
        init: Number(dom.getAttribute("data-counter"))
      }));
      van2.hydrate(styledCounter, (dom) => Counter2({
        van: van2,
        id: "styled-counter",
        init: Number(dom.getAttribute("data-counter")),
        buttonStyle
      }));
      [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
      await clickBtns(basicCounter, 3, 1);
      await clickBtns(styledCounter, 2, 5);
      [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
      assertEq(basicCounter.innerHTML, counterHTML(7, "\u{1F44D}\u{1F44E}"));
      assertEq(styledCounter.innerHTML, counterHTML(2, "\u{1F446}\u{1F447}"));
      const prevStyledCounter = styledCounter;
      selectDom.value = "\u{1F53C}\u{1F53D}";
      selectDom.dispatchEvent(new Event("input"));
      await Promise.resolve();
      [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
      assertEq(styledCounter.innerHTML, counterHTML(2, "\u{1F53C}\u{1F53D}"));
      Counter2 === OptimizedCounter ? assertEq(styledCounter, prevStyledCounter) : assert(styledCounter !== prevStyledCounter);
    });
    const examples = {
      counter: withHiddenDom(async (hiddenDom) => {
        const Counter2 = () => {
          const counter = van2.state(0);
          return div2(div2("\u2764\uFE0F: ", counter), button({ onclick: () => ++counter.val }, "\u{1F44D}"), button({ onclick: () => --counter.val }, "\u{1F44E}"));
        };
        van2.add(hiddenDom, Counter2());
        assertEq(hiddenDom.firstChild.querySelector("div").innerText, "\u2764\uFE0F: 0");
        const [incrementBtn, decrementBtn] = hiddenDom.getElementsByTagName("button");
        incrementBtn.click();
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.querySelector("div").innerText, "\u2764\uFE0F: 1");
        incrementBtn.click();
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.querySelector("div").innerText, "\u2764\uFE0F: 2");
        decrementBtn.click();
        await Promise.resolve();
        assertEq(hiddenDom.firstChild.querySelector("div").innerText, "\u2764\uFE0F: 1");
      }),
      bulletList: () => {
        const List = ({ items }) => ul(items.map((it) => li(it)));
        assertEq(List({ items: ["Item 1", "Item 2", "Item 3"] }).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
      },
      table: () => {
        const Table = ({ head, data }) => table(head ? thead(tr(head.map((h) => th(h)))) : [], tbody(data.map((row) => tr(row.map((col) => td(col))))));
        assertEq(Table({
          head: ["ID", "Name", "Country"],
          data: [
            [1, "John Doe", "US"],
            [2, "Jane Smith", "CA"],
            [3, "Bob Johnson", "AU"]
          ]
        }).outerHTML, "<table><thead><tr><th>ID</th><th>Name</th><th>Country</th></tr></thead><tbody><tr><td>1</td><td>John Doe</td><td>US</td></tr><tr><td>2</td><td>Jane Smith</td><td>CA</td></tr><tr><td>3</td><td>Bob Johnson</td><td>AU</td></tr></tbody></table>");
        assertEq(Table({
          data: [
            [1, "John Doe", "US"],
            [2, "Jane Smith", "CA"]
          ]
        }).outerHTML, "<table><tbody><tr><td>1</td><td>John Doe</td><td>US</td></tr><tr><td>2</td><td>Jane Smith</td><td>CA</td></tr></tbody></table>");
      },
      state: withHiddenDom(async (hiddenDom) => {
        const counter = van2.state(1);
        van2.derive(() => console.log(`Counter: ${counter.val}`));
        const counterSquared = van2.derive(() => counter.val * counter.val);
        const dom1 = div2(counter);
        const dom2 = input({ type: "number", value: counter, disabled: true });
        const dom3 = div2({ style: () => `font-size: ${counter.val}em;` }, "Text");
        const dom4 = div2(counter, sup(2), () => ` = ${counterSquared.val}`);
        const incrementBtn = button({ onclick: () => ++counter.val }, "Increment");
        const resetBtn = button({ onclick: () => counter.val = 1 }, "Reset");
        van2.add(hiddenDom, incrementBtn, resetBtn, dom1, dom2, dom3, dom4);
        assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>1</div><input type="number" disabled=""><div style="font-size: 1em;">Text</div><div>1<sup>2</sup> = 1</div>');
        assertEq(dom2.value, "1");
        incrementBtn.click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>2</div><input type="number" disabled=""><div style="font-size: 2em;">Text</div><div>2<sup>2</sup> = 4</div>');
        assertEq(dom2.value, "2");
        incrementBtn.click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>3</div><input type="number" disabled=""><div style="font-size: 3em;">Text</div><div>3<sup>2</sup> = 9</div>');
        assertEq(dom2.value, "3");
        resetBtn.click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>1</div><input type="number" disabled=""><div style="font-size: 1em;">Text</div><div>1<sup>2</sup> = 1</div>');
        assertEq(dom2.value, "1");
      }),
      derivedState: withHiddenDom(async (hiddenDom) => {
        const DerivedState = () => {
          const text = van2.state("VanJS");
          const length = van2.derive(() => text.val.length);
          return span("The length of ", input({ type: "text", value: text, oninput: (e) => text.val = e.target.value }), " is ", length, ".");
        };
        van2.add(hiddenDom, DerivedState());
        const dom = hiddenDom.firstChild;
        assertEq(dom.outerHTML, '<span>The length of <input type="text"> is 5.</span>');
        const inputDom = dom.querySelector("input");
        inputDom.value = "Mini-Van";
        inputDom.dispatchEvent(new Event("input"));
        await Promise.resolve();
        assertEq(dom.outerHTML, '<span>The length of <input type="text"> is 8.</span>');
      }),
      connectedProps: withHiddenDom(async (hiddenDom) => {
        const ConnectedProps = () => {
          const text = van2.state("");
          return span(input({ type: "text", value: text, oninput: (e) => text.val = e.target.value }), input({ type: "text", value: text, oninput: (e) => text.val = e.target.value }));
        };
        van2.add(hiddenDom, ConnectedProps());
        const [input1, input2] = hiddenDom.querySelectorAll("input");
        input1.value += "123";
        input1.dispatchEvent(new Event("input"));
        await Promise.resolve();
        assertEq(input1.value, "123");
        assertEq(input2.value, "123");
        input2.value += "abc";
        input2.dispatchEvent(new Event("input"));
        await Promise.resolve();
        assertEq(input1.value, "123abc");
        assertEq(input2.value, "123abc");
      }),
      fontPreview: withHiddenDom(async (hiddenDom) => {
        const FontPreview = () => {
          const size = van2.state(16), color = van2.state("black");
          return span("Size: ", input({
            type: "range",
            min: 10,
            max: 36,
            value: size,
            oninput: (e) => size.val = Number(e.target.value)
          }), " Color: ", select({ oninput: (e) => color.val = e.target.value, value: color }, ["black", "blue", "green", "red", "brown"].map((c) => option({ value: c }, c))), span({
            class: "preview",
            style: () => `font-size: ${size.val}px; color: ${color.val};`
          }, " Hello \u{1F366}VanJS"));
        };
        van2.add(hiddenDom, FontPreview());
        assertEq(hiddenDom.querySelector("span.preview").style.cssText, "font-size: 16px; color: black;");
        hiddenDom.querySelector("input").value = "20";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        assertEq(hiddenDom.querySelector("span.preview").style.cssText, "font-size: 20px; color: black;");
        hiddenDom.querySelector("select").value = "blue";
        hiddenDom.querySelector("select").dispatchEvent(new Event("input"));
        await Promise.resolve();
        assertEq(hiddenDom.querySelector("span.preview").style.cssText, "font-size: 20px; color: blue;");
      }),
      derivedEventHandler: withHiddenDom(async (hiddenDom) => {
        const Counter2 = () => {
          const counter = van2.state(0);
          const action = van2.state("\u{1F44D}");
          return span("\u2764\uFE0F ", counter, " ", select({ oninput: (e) => action.val = e.target.value, value: action }, option({ value: "\u{1F44D}" }, "\u{1F44D}"), option({ value: "\u{1F44E}" }, "\u{1F44E}")), " ", button({ onclick: van2.derive(() => action.val === "\u{1F44D}" ? () => ++counter.val : () => --counter.val) }, "Run"));
        };
        van2.add(hiddenDom, Counter2());
        const dom = hiddenDom.firstChild;
        assertEq(dom.outerHTML, '<span>\u2764\uFE0F 0 <select><option value="\u{1F44D}">\u{1F44D}</option><option value="\u{1F44E}">\u{1F44E}</option></select> <button>Run</button></span>');
        dom.querySelector("button").click();
        dom.querySelector("button").click();
        await Promise.resolve();
        assertEq(dom.outerHTML, '<span>\u2764\uFE0F 2 <select><option value="\u{1F44D}">\u{1F44D}</option><option value="\u{1F44E}">\u{1F44E}</option></select> <button>Run</button></span>');
        dom.querySelector("select").value = "\u{1F44E}";
        dom.querySelector("select").dispatchEvent(new Event("input"));
        await Promise.resolve();
        dom.querySelector("button").click();
        await Promise.resolve();
        assertEq(dom.outerHTML, '<span>\u2764\uFE0F 1 <select><option value="\u{1F44D}">\u{1F44D}</option><option value="\u{1F44E}">\u{1F44E}</option></select> <button>Run</button></span>');
      }),
      sortedList: withHiddenDom(async (hiddenDom) => {
        const SortedList = () => {
          const items = van2.state("a,b,c"), sortedBy = van2.state("Ascending");
          return span(
            "Comma-separated list: ",
            input({
              oninput: (e) => items.val = e.target.value,
              type: "text",
              value: items
            }),
            " ",
            select({ oninput: (e) => sortedBy.val = e.target.value, value: sortedBy }, option({ value: "Ascending" }, "Ascending"), option({ value: "Descending" }, "Descending")),
            // A State-derived child node
            () => sortedBy.val === "Ascending" ? ul(items.val.split(",").sort().map((i2) => li(i2))) : ul(items.val.split(",").sort().reverse().map((i2) => li(i2)))
          );
        };
        van2.add(hiddenDom, SortedList());
        hiddenDom.querySelector("input").value = "a,b,c,d";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>");
        hiddenDom.querySelector("select").value = "Descending";
        hiddenDom.querySelector("select").dispatchEvent(new Event("input"));
        await Promise.resolve();
        assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>d</li><li>c</li><li>b</li><li>a</li></ul>");
      }),
      editableList: withHiddenDom(async (hiddenDom) => {
        const ListItem = ({ text }) => {
          const deleted = van2.state(false);
          return () => deleted.val ? null : li(text, a({ onclick: () => deleted.val = true }, "\u274C"));
        };
        const EditableList = () => {
          const listDom = ul();
          const textDom = input({ type: "text" });
          return div2(textDom, " ", button({ onclick: () => van2.add(listDom, ListItem({ text: textDom.value })) }, "\u2795"), listDom);
        };
        van2.add(hiddenDom, EditableList());
        hiddenDom.querySelector("input").value = "abc";
        hiddenDom.querySelector("button").click();
        hiddenDom.querySelector("input").value = "123";
        hiddenDom.querySelector("button").click();
        hiddenDom.querySelector("input").value = "def";
        hiddenDom.querySelector("button").click();
        await Promise.resolve();
        assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>abc<a>\u274C</a></li><li>123<a>\u274C</a></li><li>def<a>\u274C</a></li></ul>");
        {
          [...hiddenDom.querySelectorAll("li")].find((e) => e.innerText.startsWith("123")).querySelector("a").click();
          await Promise.resolve();
          assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>abc<a>\u274C</a></li><li>def<a>\u274C</a></li></ul>");
        }
        {
          [...hiddenDom.querySelectorAll("li")].find((e) => e.innerText.startsWith("abc")).querySelector("a").click();
          await Promise.resolve();
          assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>def<a>\u274C</a></li></ul>");
        }
        {
          [...hiddenDom.querySelectorAll("li")].find((e) => e.innerText.startsWith("def")).querySelector("a").click();
          await Promise.resolve();
          assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul></ul>");
        }
      }),
      polymorphicBinding: withHiddenDom(async (hiddenDom) => {
        let numYellowButtonClicked = 0;
        const val2 = (v) => {
          const protoOfV = Object.getPrototypeOf(v !== null && v !== void 0 ? v : 0);
          if (protoOfV === stateProto)
            return v.val;
          if (protoOfV === Function.prototype)
            return v();
          return v;
        };
        const Button = ({ color, text, onclick }) => button({ style: () => `background-color: ${val2(color)};`, onclick }, text);
        const App = () => {
          const colorState = van2.state("green");
          const textState = van2.state("Turn Red");
          const turnRed = () => {
            colorState.val = "red";
            textState.val = "Turn Green";
            onclickState.val = turnGreen;
          };
          const turnGreen = () => {
            colorState.val = "green";
            textState.val = "Turn Red";
            onclickState.val = turnRed;
          };
          const onclickState = van2.state(turnRed);
          const lightness = van2.state(255);
          return span(Button({ color: "yellow", text: "Click Me", onclick: () => ++numYellowButtonClicked }), " ", Button({ color: colorState, text: textState, onclick: onclickState }), " ", Button({
            color: () => `rgb(${lightness.val}, ${lightness.val}, ${lightness.val})`,
            text: "Get Darker",
            onclick: () => lightness.val = Math.max(lightness.val - 10, 0)
          }));
        };
        van2.add(hiddenDom, App());
        assertEq(hiddenDom.innerHTML, '<span><button style="background-color: yellow;">Click Me</button> <button style="background-color: green;">Turn Red</button> <button style="background-color: rgb(255, 255, 255);">Get Darker</button></span>');
        const [button1, button2, button3] = hiddenDom.querySelectorAll("button");
        button1.click();
        assertEq(numYellowButtonClicked, 1);
        button1.click();
        assertEq(numYellowButtonClicked, 2);
        button2.click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<span><button style="background-color: yellow;">Click Me</button> <button style="background-color: red;">Turn Green</button> <button style="background-color: rgb(255, 255, 255);">Get Darker</button></span>');
        button2.click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<span><button style="background-color: yellow;">Click Me</button> <button style="background-color: green;">Turn Red</button> <button style="background-color: rgb(255, 255, 255);">Get Darker</button></span>');
        button3.click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<span><button style="background-color: yellow;">Click Me</button> <button style="background-color: green;">Turn Red</button> <button style="background-color: rgb(245, 245, 245);">Get Darker</button></span>');
        button3.click();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<span><button style="background-color: yellow;">Click Me</button> <button style="background-color: green;">Turn Red</button> <button style="background-color: rgb(235, 235, 235);">Get Darker</button></span>');
      }),
      hydrate: hydrateExample(Counter),
      hydrateOptimized: hydrateExample(OptimizedCounter),
      domValuedState_excludeDebug: withHiddenDom(async (hiddenDom) => {
        const TurnBold = () => {
          const vanJS = van2.state("VanJS");
          return span(button({ onclick: () => vanJS.val = b("VanJS") }, "Turn Bold"), " Welcome to ", vanJS, ". ", vanJS, " is awesome!");
        };
        van2.add(hiddenDom, TurnBold());
        const dom = hiddenDom.firstChild;
        assertEq(dom.outerHTML, "<span><button>Turn Bold</button> Welcome to VanJS. VanJS is awesome!</span>");
        dom.querySelector("button").click();
        await Promise.resolve();
        assertEq(dom.outerHTML, "<span><button>Turn Bold</button> Welcome to . <b>VanJS</b> is awesome!</span>");
      }),
      minimizeDomUpdates: withHiddenDom(async (hiddenDom) => {
        const name = van2.state("");
        const Name1 = () => {
          const numRendered = van2.state(0);
          return div2(() => {
            ++numRendered.val;
            return name.val.trim().length === 0 ? p("Please enter your name") : p("Hello ", b(name));
          }, p(i("The <p> element has been rendered ", numRendered, " time(s).")));
        };
        const Name2 = () => {
          const numRendered = van2.state(0);
          const isNameEmpty = van2.derive(() => name.val.trim().length === 0);
          return div2(() => {
            ++numRendered.val;
            return isNameEmpty.val ? p("Please enter your name") : p("Hello ", b(name));
          }, p(i("The <p> element has been rendered ", numRendered, " time(s).")));
        };
        van2.add(hiddenDom, p("Your name is: ", input({ type: "text", value: name, oninput: (e) => name.val = e.target.value })), Name1(), Name2());
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<p>Your name is: <input type="text"></p><div><p>Please enter your name</p><p><i>The &lt;p&gt; element has been rendered 1 time(s).</i></p></div><div><p>Please enter your name</p><p><i>The &lt;p&gt; element has been rendered 1 time(s).</i></p></div>');
        hiddenDom.querySelector("input").value = "T";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        hiddenDom.querySelector("input").value = "Ta";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        hiddenDom.querySelector("input").value = "Tao";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<p>Your name is: <input type="text"></p><div><p>Hello <b>Tao</b></p><p><i>The &lt;p&gt; element has been rendered 4 time(s).</i></p></div><div><p>Hello <b>Tao</b></p><p><i>The &lt;p&gt; element has been rendered 2 time(s).</i></p></div>');
        hiddenDom.querySelector("input").value = "";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<p>Your name is: <input type="text"></p><div><p>Please enter your name</p><p><i>The &lt;p&gt; element has been rendered 5 time(s).</i></p></div><div><p>Please enter your name</p><p><i>The &lt;p&gt; element has been rendered 3 time(s).</i></p></div>');
        hiddenDom.querySelector("input").value = "X";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        hiddenDom.querySelector("input").value = "Xi";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        hiddenDom.querySelector("input").value = "Xin";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await Promise.resolve();
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, '<p>Your name is: <input type="text"></p><div><p>Hello <b>Xin</b></p><p><i>The &lt;p&gt; element has been rendered 8 time(s).</i></p></div><div><p>Hello <b>Xin</b></p><p><i>The &lt;p&gt; element has been rendered 4 time(s).</i></p></div>');
      })
    };
    const gcTests = {
      bindingBasic: withHiddenDom(async (hiddenDom) => {
        const counter = van2.state(0);
        const bindingsPropKey = Object.entries(counter).find(([_, v]) => Array.isArray(v))[0];
        van2.add(hiddenDom, () => span(`Counter: ${counter.val}`));
        for (let i2 = 0; i2 < 100; ++i2)
          ++counter.val;
        await Promise.resolve();
        assertEq(hiddenDom.innerHTML, "<span>Counter: 100</span>");
        assertBetween(counter[bindingsPropKey].length, 1, 3);
      }),
      long_nestedBinding: withHiddenDom(async (hiddenDom) => {
        const renderPre = van2.state(false), text = van2.state("Text");
        const bindingsPropKey = Object.entries(renderPre).find(([_, v]) => Array.isArray(v))[0];
        const dom = div2(() => (renderPre.val ? pre : div2)(() => `--${text.val}--`));
        van2.add(hiddenDom, dom);
        for (let i2 = 0; i2 < 20; ++i2) {
          renderPre.val = !renderPre.val;
          await Promise.resolve();
        }
        await sleep(1e3);
        assertBetween(renderPre[bindingsPropKey].length, 1, 3);
        assertBetween(text[bindingsPropKey].length, 1, 3);
      }),
      long_conditionalBinding: withHiddenDom(async (hiddenDom) => {
        const cond = van2.state(true);
        const a2 = van2.state(0), b2 = van2.state(0), c = van2.state(0), d = van2.state(0);
        const bindingsPropKey = Object.entries(cond).find(([_, v]) => Array.isArray(v))[0];
        const dom = div2(() => cond.val ? a2.val + b2.val : c.val + d.val);
        van2.add(hiddenDom, dom);
        const allStates = [cond, a2, b2, c, d];
        for (let i2 = 0; i2 < 100; ++i2) {
          const randomState = allStates[Math.floor(Math.random() * allStates.length)];
          if (randomState === cond)
            randomState.val = !randomState.val;
          else
            ++randomState.val;
          await Promise.resolve();
        }
        allStates.forEach((s) => assertBetween(s[bindingsPropKey].length, 0, 10));
        await sleep(1e3);
        allStates.forEach((s) => assertBetween(s[bindingsPropKey].length, 0, 3));
      }),
      long_deriveBasic: async () => {
        const history = [];
        const a2 = van2.state(0);
        const listenersPropKey = Object.entries(a2).filter(([_, v]) => Array.isArray(v))[1][0];
        van2.derive(() => history.push(a2.val));
        for (let i2 = 0; i2 < 100; ++i2) {
          ++a2.val;
          await Promise.resolve();
        }
        assertEq(history.length, 101);
        assertBetween(a2[listenersPropKey].length, 1, 3);
      },
      long_deriveInBindingFunc: withHiddenDom(async (hiddenDom) => {
        const renderPre = van2.state(false), prefix = van2.state("Prefix");
        const bindingsPropKey = Object.entries(renderPre).find(([_, v]) => Array.isArray(v))[0];
        const listenersPropKey = Object.entries(renderPre).filter(([_, v]) => Array.isArray(v))[1][0];
        const dom = div2(() => {
          const text = van2.derive(() => `${prefix.val} - Suffix`);
          return (renderPre.val ? pre : div2)(() => `--${text.val}--`);
        });
        van2.add(hiddenDom, dom);
        for (let i2 = 0; i2 < 20; ++i2) {
          renderPre.val = !renderPre.val;
          await Promise.resolve();
        }
        await sleep(1e3);
        assertBetween(renderPre[bindingsPropKey].length, 1, 3);
        assertBetween(prefix[listenersPropKey].length, 1, 3);
      }),
      long_stateDerivedProp: withHiddenDom(async (hiddenDom) => {
        const renderPre = van2.state(false), class1 = van2.state(true);
        const bindingsPropKey = Object.entries(renderPre).find(([_, v]) => Array.isArray(v))[0];
        const listenersPropKey = Object.entries(renderPre).filter(([_, v]) => Array.isArray(v))[1][0];
        const dom = div2(() => (renderPre.val ? pre : div2)({ class: () => class1.val ? "class1" : "class2" }, "Text"));
        van2.add(hiddenDom, dom);
        for (let i2 = 0; i2 < 20; ++i2) {
          renderPre.val = !renderPre.val;
          await Promise.resolve();
        }
        await sleep(1e3);
        assertBetween(renderPre[bindingsPropKey].length, 1, 3);
        assertBetween(class1[listenersPropKey].length, 1, 3);
      }),
      long_stateDerivedEventHandler: withHiddenDom(async (hiddenDom) => {
        const renderPre = van2.state(false), handlerType = van2.state(1);
        const bindingsPropKey = Object.entries(renderPre).find(([_, v]) => Array.isArray(v))[0];
        const listenersPropKey = Object.entries(renderPre).filter(([_, v]) => Array.isArray(v))[1][0];
        const dom = div2(() => (renderPre.val ? pre : div2)(button({
          oncustom: van2.derive(() => handlerType.val === 1 ? () => van2.add(hiddenDom, p("Handler 1 triggered!")) : () => van2.add(hiddenDom, p("Handler 2 triggered!")))
        })));
        van2.add(hiddenDom, dom);
        for (let i2 = 0; i2 < 20; ++i2) {
          renderPre.val = !renderPre.val;
          await Promise.resolve();
        }
        await sleep(1e3);
        assertBetween(renderPre[bindingsPropKey].length, 1, 3);
        assertBetween(handlerType[listenersPropKey].length, 1, 3);
      }),
      long_conditionalDerivedState: async () => {
        const cond = van2.state(true);
        const a2 = van2.state(0), b2 = van2.state(0), c = van2.state(0), d = van2.state(0);
        const listenersPropKey = Object.entries(a2).filter(([_, v]) => Array.isArray(v))[1][0];
        van2.derive(() => cond.val ? a2.val + b2.val : c.val + d.val);
        const allStates = [cond, a2, b2, c, d];
        for (let i2 = 0; i2 < 100; ++i2) {
          const randomState = allStates[Math.floor(Math.random() * allStates.length)];
          if (randomState === cond)
            randomState.val = !randomState.val;
          else
            ++randomState.val;
        }
        allStates.forEach((s) => assertBetween(s[listenersPropKey].length, 0, 10));
        await sleep(1e3);
        allStates.forEach((s) => assertBetween(s[listenersPropKey].length, 0, 3));
      }
    };
    const suites = { tests, examples, gcTests };
    const skipLong = new URL(location.href).searchParams.has("skiplong");
    if (debug)
      suites.debugTests = debugTests;
    for (const [k, v] of Object.entries(suites)) {
      for (const [name, func] of Object.entries(v)) {
        if (skipLong && name.startsWith("long_"))
          continue;
        if (debug && name.endsWith("_excludeDebug"))
          continue;
        ++window.numTests;
        const result = van2.state(""), msg = van2.state("");
        van2.add(msgDom2, div2(pre(`Running ${k}.${name}...`), pre(result), pre(" "), pre(button({ onclick: async () => {
          try {
            await func();
            result.val = "\u2705";
            msg.val = "Rerun succeeded!";
          } catch (e) {
            result.val = "\u274C";
            msg.val = "Rerun failed!";
            throw e;
          }
        } }, "Rerun this test")), pre(" "), pre(msg)));
        try {
          await func();
          result.val = "\u2705";
        } catch (e) {
          result.val = "\u274C";
          van2.add(msgDom2, div2({ style: "color: red" }, "Test failed, please check console for error message."));
          throw e;
        }
      }
    }
  };
  var testVanFile = async (path, type) => {
    const van = await (type === "es6" ? import(path).then((r) => r.default) : fetch(path).then((r) => r.text()).then((t) => (eval(t), window.van)));
    const { div, h2 } = van.tags;
    const msgDom = div({ class: "testMsg" });
    van.add(document.getElementById("msgPanel"), h2(`Running tests for ${path}`), msgDom);
    await runTests(van, msgDom, { debug: path.includes(".debug") });
  };

  // ../test/van.test.forbundle.js
  window.testVanFile = testVanFile;
})();
