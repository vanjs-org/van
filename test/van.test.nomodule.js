'use strict';
(() => {
  // ../test/van.test.js
  window.numTests = 0;
  var runTests = async (van2, msgDom2, { debug }) => {
    const { a, button, div: div2, input, li, option, p, pre, select, span, table, tbody, td, th, thead, tr, ul } = van2.tags;
    const assert = (cond) => {
      if (!cond)
        throw new Error("Assertion failed");
    };
    const assertEq = (lhs, rhs) => {
      if (lhs !== rhs)
        throw new Error(`Assertion failed. Expected equal. Actual lhs: ${lhs}, rhs: ${rhs}`);
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
    const waitMsOnDomUpdates = 5;
    const withHiddenDom = (func) => async () => {
      const dom = div2({ class: "hidden" });
      van2.add(document.body, dom);
      await func(dom);
      dom.remove();
    };
    const capturingErrors = async (func) => {
      van2.startCapturingErrors();
      await func();
      van2.stopCapturingErrors();
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
      tags_stateAsProp_connected: withHiddenDom(async (hiddenDom) => {
        const href = van2.state("http://example.com/");
        const dom = a({ href }, "Test Link");
        van2.add(hiddenDom, dom);
        assertEq(dom.href, "http://example.com/");
        href.val = "https://vanjs.org/";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "https://vanjs.org/");
      }),
      tags_stateAsProp_disconnected: async () => {
        const href = van2.state("http://example.com/");
        const dom = a({ href }, "Test Link");
        assertEq(dom.href, "http://example.com/");
        href.val = "https://vanjs.org/";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "http://example.com/");
      },
      tags_stateAsOnClickHandler_connected: withHiddenDom(async (hiddenDom) => {
        const dom = div2();
        van2.add(hiddenDom, dom);
        const handler = van2.state(() => van2.add(dom, p("Button clicked!")));
        van2.add(dom, button({ onclick: handler }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        handler.val = () => van2.add(dom, div2("Button clicked!"));
        await sleep(waitMsOnDomUpdates);
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>");
      }),
      tags_stateAsOnClickHandler_disconnected: async () => {
        const dom = div2();
        const handler = van2.state(() => van2.add(dom, p("Button clicked!")));
        van2.add(dom, button({ onclick: handler }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        handler.val = () => van2.add(dom, div2("Button clicked!"));
        await sleep(waitMsOnDomUpdates);
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><p>Button clicked!</p></div>");
      },
      tags_stateDerivedProp_connected: withHiddenDom(async (hiddenDom) => {
        const host = van2.state("example.com");
        const path2 = van2.state("/hello");
        const dom = a({ href: { deps: [host, path2], f: (host2, path3) => `https://${host2}${path3}` } }, "Test Link");
        van2.add(hiddenDom, dom);
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        path2.val = "/start";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "https://vanjs.org/start");
      }),
      tags_stateDerivedProp_disconnected: async () => {
        const host = van2.state("example.com");
        const path2 = van2.state("/hello");
        const dom = a({ href: { deps: [host, path2], f: (host2, path3) => `https://${host2}${path3}` } }, "Test Link");
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        path2.val = "/start";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "https://example.com/hello");
      },
      tags_stateDerivedProp_nonStateDeps_connected: withHiddenDom(async (hiddenDom) => {
        const host = van2.state("example.com");
        const path2 = "/hello";
        const dom = a({ href: { deps: [host, path2], f: (host2, path3) => `https://${host2}${path3}` } }, "Test Link");
        van2.add(hiddenDom, dom);
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "https://vanjs.org/hello");
      }),
      tags_stateDerivedProp_nonStateDeps_disconnected: async () => {
        const host = van2.state("example.com");
        const path2 = "/hello";
        const dom = a({ href: { deps: [host, path2], f: (host2, path3) => `https://${host2}${path3}` } }, "Test Link");
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "https://example.com/hello");
      },
      tags_stateDerivedOnClickHandler_connected: withHiddenDom(async (hiddenDom) => {
        const dom = div2();
        van2.add(hiddenDom, dom);
        const addPElement = van2.state(true);
        van2.add(dom, button({ onclick: {
          deps: [addPElement],
          f: (addPElement2) => addPElement2 ? () => van2.add(dom, p("Button clicked!")) : () => van2.add(dom, div2("Button clicked!"))
        } }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        addPElement.val = false;
        await sleep(waitMsOnDomUpdates);
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>");
      }),
      tags_stateDerivedOnClickHandler_disconnected: async () => {
        const dom = div2();
        const addPElement = van2.state(true);
        van2.add(dom, button({ onclick: {
          deps: [addPElement],
          f: (addPElement2) => addPElement2 ? () => van2.add(dom, p("Button clicked!")) : () => van2.add(dom, div2("Button clicked!"))
        } }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        addPElement.val = false;
        await sleep(waitMsOnDomUpdates);
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><p>Button clicked!</p></div>");
      },
      tags_dataAttributes_connected: withHiddenDom(async (hiddenDom) => {
        const lineNum = van2.state(1);
        const dom = div2({
          "data-type": "line",
          "data-id": lineNum,
          "data-line": { deps: [lineNum], f: (num) => `line=${num}` }
        }, "This is a test line");
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
        lineNum.val = 3;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, '<div data-type="line" data-id="3" data-line="line=3">This is a test line</div>');
      }),
      tags_dataAttributes_disconnected: async () => {
        const lineNum = van2.state(1);
        const dom = div2({
          "data-type": "line",
          "data-id": lineNum,
          "data-line": { deps: [lineNum], f: (num) => `line=${num}` }
        }, "This is a test line");
        assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
        lineNum.val = 3;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
      },
      tags_readonlyProps_connected: withHiddenDom(async (hiddenDom) => {
        const form = van2.state("form1");
        const dom = button({ form }, "Button");
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        form.val = "form2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, '<button form="form2">Button</button>');
        assertEq(input({ list: "datalist1" }).outerHTML, '<input list="datalist1">');
      }),
      tags_readonlyProps_disconnected: async () => {
        const form = van2.state("form1");
        const dom = button({ form }, "Button");
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        form.val = "form2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        assertEq(input({ list: "datalist1" }).outerHTML, '<input list="datalist1">');
      },
      tags_stateAsChild_connected: withHiddenDom(async (hiddenDom) => {
        const line2 = van2.state("Line 2");
        const dom = div2(pre("Line 1"), pre(line2), pre("Line 3"));
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = "Line 2: Extra Stuff";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2: Extra Stuff</pre><pre>Line 3</pre></div>");
        line2.val = null;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>");
        line2.val = "Line 2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>");
      }),
      tags_stateAsChild_disconnected: async () => {
        const line2 = van2.state("Line 2");
        const dom = div2(pre("Line 1"), pre(line2), pre("Line 3"));
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = "Line 2: Extra Stuff";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = null;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
      },
      tags_stateAsChild_emptyStrWontDeleteDom: withHiddenDom(async (hiddenDom) => {
        const text = van2.state("Text");
        const dom = p(text);
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<p>Text</p>");
        text.val = "";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<p></p>");
        text.val = "Text";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<p>Text</p>");
      }),
      tagsNS_svg: () => {
        const { circle, path: path2, svg } = van2.tagsNS("http://www.w3.org/2000/svg");
        const dom = svg({ width: "16px", viewBox: "0 0 50 50" }, circle({ cx: "25", cy: "25", "r": "20", stroke: "black", "stroke-width": "2", fill: "yellow" }), circle({ cx: "16", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black" }), circle({ cx: "34", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black" }), path2({ "d": "M 15 30 Q 25 40, 35 30", stroke: "black", "stroke-width": "2", fill: "transparent" }));
        assertEq(dom.outerHTML, '<svg width="16px" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" stroke="black" stroke-width="2" fill="yellow"></circle><circle cx="16" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><circle cx="34" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><path d="M 15 30 Q 25 40, 35 30" stroke="black" stroke-width="2" fill="transparent"></path></svg>');
      },
      tagsNS_math: () => {
        const { math, mi, mn, mo, mrow, msup } = van2.tagsNS("http://www.w3.org/1998/Math/MathML");
        const dom = math(msup(mi("e"), mrow(mi("i"), mi("\u03C0"))), mo("+"), mn("1"), mo("="), mn("0"));
        assertEq(dom.outerHTML, "<math><msup><mi>e</mi><mrow><mi>i</mi><mi>\u03C0</mi></mrow></msup><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn></math>");
      },
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
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre>Line 2: Extra Stuff</pre><pre>Line 3</pre></div>');
        line2.val = null;
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>');
        line2.val = "Line 2";
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>');
      }),
      add_addState_disconnected: async () => {
        const line2 = van2.state("Line 2");
        const dom = div2();
        assertEq(van2.add(dom, pre("Line 1"), pre(line2), pre("Line 3")), dom);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = "Line 2: Extra Stuff";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = null;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
      },
      state_val: () => {
        const s = van2.state("Init State");
        assertEq(s.val, "Init State");
        s.val = "Changed State";
        assertEq(s.val, "Changed State");
      },
      state_onnew: () => {
        const history = [];
        const s = van2.state("This");
        s.onnew((v, oldV) => history.push({ from: oldV, to: v }));
        s.val = "is";
        s.val = "a";
        s.val = "test";
        s.val = "test";
        assertEq(JSON.stringify(history), '[{"from":"This","to":"is"},{"from":"is","to":"a"},{"from":"a","to":"test"}]');
      },
      state_derivedStates: () => {
        const numItems = van2.state(0);
        const items = van2.state([]);
        numItems.onnew((v) => items.val = [...Array(v).keys()].map((i) => `Item ${i + 1}`));
        const selectedIndex = van2.state(0);
        items.onnew(() => selectedIndex.val = 0);
        const selectedItem = van2.state("");
        const setSelectedItem = () => selectedItem.val = items.val[selectedIndex.val];
        items.onnew(setSelectedItem);
        selectedIndex.onnew(setSelectedItem);
        numItems.val = 3;
        assertEq(numItems.val, 3);
        assertEq(items.val.join(","), "Item 1,Item 2,Item 3");
        assertEq(selectedIndex.val, 0);
        assertEq(selectedItem.val, "Item 1");
        selectedIndex.val = 2;
        assertEq(selectedIndex.val, 2);
        assertEq(selectedItem.val, "Item 3");
        numItems.val = 5;
        assertEq(numItems.val, 5);
        assertEq(items.val.join(","), "Item 1,Item 2,Item 3,Item 4,Item 5");
        assertEq(selectedIndex.val, 0);
        assertEq(selectedItem.val, "Item 1");
        selectedIndex.val = 3;
        assertEq(selectedIndex.val, 3);
        assertEq(selectedItem.val, "Item 4");
      },
      bind_dynamicDom: withHiddenDom(async (hiddenDom) => {
        const verticalPlacement = van2.state(false);
        const button1Text = van2.state("Button 1"), button2Text = van2.state("Button 2"), button3Text = van2.state("Button 3");
        const dom = van2.bind(verticalPlacement, (v) => v ? div2(div2(button(button1Text)), div2(button(button2Text)), div2(button(button3Text))) : div2(button(button1Text), button(button2Text), button(button3Text)));
        assertEq(van2.add(hiddenDom, dom), hiddenDom);
        assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2</button><button>Button 3</button></div>");
        button2Text.val = "Button 2: Extra";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
        verticalPlacement.val = true;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
        assertEq(hiddenDom.firstChild.outerHTML, "<div><div><button>Button 1</button></div><div><button>Button 2: Extra</button></div><div><button>Button 3</button></div></div>");
        button2Text.val = "Button 2: Extra Extra";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
        assertEq(hiddenDom.firstChild.outerHTML, "<div><div><button>Button 1</button></div><div><button>Button 2: Extra Extra</button></div><div><button>Button 3</button></div></div>");
      }),
      bind_statefulDynamicDom: withHiddenDom(async (hiddenDom) => {
        const numItems = van2.state(0);
        const items = van2.state([]);
        numItems.onnew((v) => items.val = [...Array(v).keys()].map((i) => `Item ${i + 1}`));
        const selectedIndex = van2.state(0);
        items.onnew(() => selectedIndex.val = 0);
        const dom = van2.bind(items, selectedIndex, (items2, selectedIndex2, dom2, oldItems, oldSelectedIndex) => {
          if (dom2 && items2 === oldItems) {
            const itemDoms = dom2.childNodes;
            itemDoms[oldSelectedIndex].classList.remove("selected");
            itemDoms[selectedIndex2].classList.add("selected");
            return dom2;
          }
          return ul(items2.map((item, i) => li({ class: i === selectedIndex2 ? "selected" : "" }, item)));
        });
        van2.add(hiddenDom, dom);
        numItems.val = 3;
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="selected">Item 1</li><li class="">Item 2</li><li class="">Item 3</li></ul>');
        const rootDom1stIteration = hiddenDom.firstChild;
        selectedIndex.val = 1;
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
        assertEq(hiddenDom.firstChild, rootDom1stIteration);
        numItems.val = 5;
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="selected">Item 1</li><li class="">Item 2</li><li class="">Item 3</li><li class="">Item 4</li><li class="">Item 5</li></ul>');
        assert(hiddenDom.firstChild !== rootDom1stIteration);
        assertEq(rootDom1stIteration.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
        const rootDom2ndIteration = hiddenDom.firstChild;
        selectedIndex.val = 2;
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="">Item 1</li><li class="">Item 2</li><li class="selected">Item 3</li><li class="">Item 4</li><li class="">Item 5</li></ul>');
        assertEq(hiddenDom.firstChild, rootDom2ndIteration);
        assertEq(rootDom1stIteration.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
      }),
      bind_nullToRemoveDom: withHiddenDom(async (hiddenDom) => {
        const line1 = van2.state("Line 1"), line2 = van2.state("Line 2"), line3 = van2.state("Line 3"), line4 = van2.state(""), line5 = van2.state(null);
        const dom = div2(
          van2.bind(line1, (l) => l === "" ? null : p(l)),
          van2.bind(line2, (l) => l === "" ? null : p(l)),
          p(line3),
          // line4 won't appear in the DOM tree as its initial value is null
          van2.bind(line4, (l) => l === "" ? null : p(l)),
          // line5 won't appear in the DOM tree as its initial value is null
          p(line5)
        );
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p><p></p></div>");
        line2.val = "";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
        line2.val = "Line 2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
        line3.val = null;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
        line3.val = "Line 3";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
      }),
      bind_undefinedToRemoveDom: withHiddenDom(async (hiddenDom) => {
        const line1 = van2.state("Line 1"), line2 = van2.state("Line 2"), line3 = van2.state("Line 3"), line4 = van2.state(""), line5 = van2.state(void 0);
        const dom = div2(
          van2.bind(line1, (l) => l === "" ? void 0 : p(l)),
          van2.bind(line2, (l) => l === "" ? void 0 : p(l)),
          p(line3),
          // line4 won't appear in the DOM tree as its initial value is undefined
          van2.bind(line4, (l) => l === "" ? void 0 : p(l)),
          // line5 won't appear in the DOM tree as its initial value is undefined
          p(line5)
        );
        van2.add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p><p></p></div>");
        line2.val = "";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
        line2.val = "Line 2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
        line3.val = void 0;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
        line3.val = "Line 3";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
      }),
      bind_nonStateDeps: withHiddenDom(async (hiddenDom) => {
        const part1 = "\u{1F44B}Hello ", part2 = van2.state("\u{1F5FA}\uFE0FWorld");
        const dom = van2.bind(part1, part2, (part12, part22) => part12 + part22);
        assertEq(van2.add(hiddenDom, dom), hiddenDom);
        assertEq(dom.textContent, "\u{1F44B}Hello \u{1F5FA}\uFE0FWorld");
        assertEq(hiddenDom.innerHTML, "\u{1F44B}Hello \u{1F5FA}\uFE0FWorld");
        part2.val = "\u{1F366}VanJS";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.textContent, "\u{1F44B}Hello \u{1F5FA}\uFE0FWorld");
        assertEq(hiddenDom.innerHTML, "\u{1F44B}Hello \u{1F366}VanJS");
      })
    };
    const debugTests = {
      tags_invalidProp_nonFuncOnHandler: () => {
        const counter = van2.state(0);
        assertError("Only functions are allowed", () => button({ onclick: ++counter.val }, "Increment"));
      },
      tags_invalidProp_nonPrimitiveValue: () => {
        assertError(/Only.*are valid prop value types/, () => a({ href: null }));
        assertError(/Only.*are valid prop value types/, () => a({ href: void 0 }));
        assertError(/Only.*are valid prop value types/, () => a({ href: (x) => x * 2 }));
        assertError(/Only.*are valid prop value types/, () => a({ href: van2.state({}) }));
        assertError(/Only.*are valid prop value types/, () => a({ href: van2.state(null) }));
        assertError(/Only.*are valid prop value types/, () => a({ href: van2.state(void 0) }));
        assertError(/Only.*are valid prop value types/, () => a({ href: van2.state((x) => x * 2) }));
        const s = van2.state(0);
        assertError(/Only.*are valid prop value types/, () => a({ href: { deps: [s], f: () => {
        } } }));
        assertError(/Only.*are valid prop value types/, () => a({ href: { deps: [s], f: () => null } }));
        assertError(/Only.*are valid prop value types/, () => a({ href: { deps: [s], f: () => void 0 } }));
        assertError(/Only.*are valid prop value types/, () => a({ href: { deps: [s], f: () => (x) => x * 2 } }));
      },
      tags_invalidChild: () => {
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), {}, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), (x) => x * 2, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), van2.state({}), p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), van2.state((x) => x * 2), p()));
      },
      tags_alreadyConnectedChild: withHiddenDom((hiddenDom) => {
        const dom = p();
        van2.add(hiddenDom, dom);
        assertError("already connected to document", () => div2(p(), dom, p()));
      }),
      tagsNS_invalidNs: () => {
        assertError("Must provide a string", () => van2.tagsNS(1));
        assertError("Must provide a string", () => van2.tagsNS(null));
        assertError("Must provide a string", () => van2.tagsNS(void 0));
        assertError("Must provide a string", () => van2.tagsNS({}));
        assertError("Must provide a string", () => van2.tagsNS((x) => x * 2));
      },
      add_1stArgNotDom: () => {
        assertError("1st argument of `add` function must be a DOM Node object", () => van2.add({}, div2()));
      },
      add_invalidChild: () => {
        const dom = div2();
        assertError(/Only.*are valid child of a DOM Node/, () => van2.add(dom, div2(), {}, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => van2.add(dom, div2(), (x) => x * 2, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => van2.add(dom, div2(), van2.state({}), p()));
        assertError(/Only.*are valid child of a DOM Node/, () => van2.add(dom, div2(), van2.state((x) => x * 2), p()));
      },
      add_alreadyConnectedChild: withHiddenDom((hiddenDom) => {
        const dom = div2();
        van2.add(hiddenDom, dom);
        assertError("already connected to document", () => van2.add(hiddenDom, dom));
      }),
      state_invalidInitialVal: () => {
        assertError("DOM Node is not valid", () => van2.state(document));
        assertError("couldn't have value to other state", () => van2.state(van2.state(0)));
      },
      state_invalidValSet: () => {
        const s = van2.state(0);
        assertError("DOM Node is not valid", () => s.val = document);
        assertError("couldn't have value to other state", () => s.val = van2.state(0));
      },
      state_nonFunctionOnnewListener: () => {
        const s = van2.state(0);
        let t2 = 0;
        assertError("You should pass-in functions to register `onnew` handlers", () => s.onnew(++t2));
      },
      state_mutatingVal: () => {
        {
          const t2 = van2.state({ a: 2 });
          assertError("TypeError:", () => t2.val.a = 3);
        }
        {
          const t2 = van2.state({ b: 1 });
          t2.val = { b: 2 };
          assertError("TypeError:", () => t2.val.b = 3);
        }
      },
      bind_noStates: () => {
        assertError("1 or more states", () => van2.bind());
        assertError("1 or more states", () => van2.bind((x) => x * 2));
      },
      bind_lastArgNotFunc: () => assertError("must be the generation function", () => van2.bind(van2.state(0), van2.state(1))),
      bind_invalidInitialResult: () => {
        const s = van2.state(0);
        assertError("must be DOM node, primitive, null or undefined", () => van2.bind(s, () => ({})));
        assertError("must be DOM node, primitive, null or undefined", () => van2.bind(s, () => (x) => x * 2));
      },
      bind_invalidFollowupResult: withHiddenDom(async (hiddenDom) => {
        const s = van2.state(1);
        van2.add(hiddenDom, van2.bind(s, (s2) => s2 || {}), van2.bind(s, (s2) => s2 || ((x) => x * 2)));
        await capturingErrors(async () => {
          s.val = 0;
          await sleep(waitMsOnDomUpdates);
          assert(van2.capturedErrors.length === 2 && van2.capturedErrors.every((e) => e.includes("must be DOM node, primitive, null or undefined")));
        });
      }),
      bind_derivedDom_domResultAlreadyConnected: withHiddenDom(async (hiddenDom) => {
        const dom = div2();
        van2.add(hiddenDom, dom);
        const num = van2.state(1);
        van2.add(hiddenDom, van2.bind(num, (num2, prevDom) => {
          if (num2 === 1)
            return div2();
          if (num2 === 2)
            return prevDom;
          if (num2 === 3)
            return dom;
        }));
        num.val = 2;
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.innerHTML, "<div></div><div></div>");
        await capturingErrors(async () => {
          num.val = 3;
          await sleep(waitMsOnDomUpdates);
          assert(van2.capturedErrors[0].includes("it shouldn't be already connected to document"));
        });
      })
    };
    const examples = {
      counter: withHiddenDom(async (hiddenDom) => {
        const Counter = () => {
          const counter = van2.state(0);
          return div2(div2("\u2764\uFE0F: ", counter), button({ onclick: () => ++counter.val }, "\u{1F44D}"), button({ onclick: () => --counter.val }, "\u{1F44E}"));
        };
        van2.add(hiddenDom, Counter());
        assertEq(hiddenDom.firstChild.querySelector("div").innerText, "\u2764\uFE0F: 0");
        const [incrementBtn, decrementBtn] = hiddenDom.getElementsByTagName("button");
        incrementBtn.click();
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.firstChild.querySelector("div").innerText, "\u2764\uFE0F: 1");
        incrementBtn.click();
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.firstChild.querySelector("div").innerText, "\u2764\uFE0F: 2");
        decrementBtn.click();
        await sleep(waitMsOnDomUpdates);
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
      stateExample: withHiddenDom(async (hiddenDom) => {
        const counter = van2.state(1);
        counter.onnew((v, oldV) => console.log(`Counter: ${oldV} -> ${v}`));
        const dom1 = div2(counter);
        const dom2 = input({ type: "number", value: counter, disabled: true });
        const dom3 = div2({ style: { deps: [counter], f: (c) => `font-size: ${c}em;` } }, "Text");
        const dom4 = div2(van2.bind(counter, (c) => `${c}^2 = ${c * c}`));
        const incrementBtn = button({ onclick: () => ++counter.val }, "Increment");
        const resetBtn = button({ onclick: () => counter.val = 1 }, "Reset");
        van2.add(hiddenDom, incrementBtn, resetBtn, dom1, dom2, dom3, dom4);
        assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>1</div><input type="number" disabled=""><div style="font-size: 1em;">Text</div><div>1^2 = 1</div>');
        assertEq(dom2.value, "1");
        incrementBtn.click();
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>2</div><input type="number" disabled=""><div style="font-size: 2em;">Text</div><div>2^2 = 4</div>');
        assertEq(dom2.value, "2");
        incrementBtn.click();
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>3</div><input type="number" disabled=""><div style="font-size: 3em;">Text</div><div>3^2 = 9</div>');
        assertEq(dom2.value, "3");
        resetBtn.click();
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>1</div><input type="number" disabled=""><div style="font-size: 1em;">Text</div><div>1^2 = 1</div>');
        assertEq(dom2.value, "1");
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
        await sleep(waitMsOnDomUpdates);
        assertEq(input1.value, "123");
        assertEq(input2.value, "123");
        input2.value += "abc";
        input2.dispatchEvent(new Event("input"));
        await sleep(waitMsOnDomUpdates);
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
            oninput: (e) => size.val = e.target.value
          }), " Color: ", select({ oninput: (e) => color.val = e.target.value, value: color }, ["black", "blue", "green", "red", "brown"].map((c) => option({ value: c }, c))), span({
            class: "preview",
            style: { deps: [size, color], f: (size2, color2) => `font-size: ${size2}px; color: ${color2};` }
          }, " Hello \u{1F366}VanJS"));
        };
        van2.add(hiddenDom, FontPreview());
        assertEq(hiddenDom.querySelector("span.preview").style.cssText, "font-size: 16px; color: black;");
        hiddenDom.querySelector("input").value = "20";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.querySelector("span.preview").style.cssText, "font-size: 20px; color: black;");
        hiddenDom.querySelector("select").value = "blue";
        hiddenDom.querySelector("select").dispatchEvent(new Event("input"));
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.querySelector("span.preview").style.cssText, "font-size: 20px; color: blue;");
      }),
      sortedList: withHiddenDom(async (hiddenDom) => {
        const SortedList = () => {
          const items = van2.state("a,b,c"), sortedBy = van2.state("Ascending");
          return span("Comma-separated list: ", input({
            oninput: (e) => items.val = e.target.value,
            type: "text",
            value: items
          }), " ", select({ oninput: (e) => sortedBy.val = e.target.value, value: sortedBy }, option({ value: "Ascending" }, "Ascending"), option({ value: "Descending" }, "Descending")), van2.bind(items, sortedBy, (items2, sortedBy2) => sortedBy2 === "Ascending" ? ul(items2.split(",").sort().map((i) => li(i))) : ul(items2.split(",").sort().reverse().map((i) => li(i)))));
        };
        van2.add(hiddenDom, SortedList());
        hiddenDom.querySelector("input").value = "a,b,c,d";
        hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>");
        hiddenDom.querySelector("select").value = "Descending";
        hiddenDom.querySelector("select").dispatchEvent(new Event("input"));
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>d</li><li>c</li><li>b</li><li>a</li></ul>");
      }),
      editableList: withHiddenDom(async (hiddenDom) => {
        const ListItem = ({ text }) => {
          const deleted = van2.state(false);
          return van2.bind(deleted, (d) => d ? null : li(text, a({ onclick: () => deleted.val = true }, "\u274C")));
        };
        const EditableList = () => {
          const listDom = ul();
          const textDom = input({ type: "text" });
          return div2(textDom, " ", button({
            onclick: () => van2.add(listDom, ListItem({ text: textDom.value }))
          }, "\u2795"), listDom);
        };
        van2.add(hiddenDom, EditableList());
        hiddenDom.querySelector("input").value = "abc";
        hiddenDom.querySelector("button").click();
        hiddenDom.querySelector("input").value = "123";
        hiddenDom.querySelector("button").click();
        hiddenDom.querySelector("input").value = "def";
        hiddenDom.querySelector("button").click();
        await sleep(waitMsOnDomUpdates);
        assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>abc<a>\u274C</a></li><li>123<a>\u274C</a></li><li>def<a>\u274C</a></li></ul>");
        {
          [...hiddenDom.querySelectorAll("li")].find((e) => e.innerText.startsWith("123")).querySelector("a").click();
          await sleep(waitMsOnDomUpdates);
          assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>abc<a>\u274C</a></li><li>def<a>\u274C</a></li></ul>");
        }
        {
          [...hiddenDom.querySelectorAll("li")].find((e) => e.innerText.startsWith("abc")).querySelector("a").click();
          await sleep(waitMsOnDomUpdates);
          assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>def<a>\u274C</a></li></ul>");
        }
        {
          [...hiddenDom.querySelectorAll("li")].find((e) => e.innerText.startsWith("def")).querySelector("a").click();
          await sleep(waitMsOnDomUpdates);
          assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul></ul>");
        }
      })
    };
    const gcTests = {
      derivedDom: withHiddenDom(async (hiddenDom) => {
        const renderPre = van2.state(false);
        const text = van2.state("Text");
        const TextLine = (renderPre2) => (renderPre2 ? pre : div2)(van2.bind(text, (t2) => `--${t2}--`));
        const dom = div2(van2.bind(renderPre, TextLine));
        van2.add(hiddenDom, dom);
        for (let i = 0; i < 20; ++i) {
          renderPre.val = !renderPre.val;
          await sleep(waitMsOnDomUpdates);
        }
        await sleep(1e3);
        const bindings = Object.values(text).find((v) => Array.isArray(v) && v.length > 0);
        assert(bindings.length < 10);
      })
    };
    const suites = { tests, examples, gcTests };
    if (debug)
      suites.debugTests = debugTests;
    for (const [k, v] of Object.entries(suites)) {
      for (const [name, func] of Object.entries(v)) {
        ++window.numTests;
        const result = van2.state("");
        const msg = van2.state("");
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
