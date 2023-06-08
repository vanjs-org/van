'use strict';
(() => {
  // ../test/van.test.js
  window.numTests = 0;
  var runTests = async (vanObj, msgDom2, { debug }) => {
    const { add, tags, tagsNS, state, bind } = vanObj;
    const { a, button, div: div2, input, li, option, p, pre, select, span, table, tbody, td, th, thead, tr, ul } = tags;
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
          if (msg.test(e.message))
            caught = true;
          else
            throw e;
        } else {
          if (e.message.includes(msg))
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
      add(document.body, dom);
      await func(dom);
      dom.remove();
    };
    const capturingErrors = async (func) => {
      vanObj.startCapturingErrors();
      await func();
      vanObj.stopCapturingErrors();
    };
    const tests = {
      tagsTest_basic: () => {
        const dom = div2(p("\u{1F44B}Hello"), ul(li("\u{1F5FA}\uFE0FWorld"), li(a({ href: "https://vanjs.org/" }, "\u{1F366}VanJS"))));
        assertEq(dom.outerHTML, '<div><p>\u{1F44B}Hello</p><ul><li>\u{1F5FA}\uFE0FWorld</li><li><a href="https://vanjs.org/">\u{1F366}VanJS</a></li></ul></div>');
      },
      tagsTest_onclickHandler: () => {
        const dom = div2(button({ onclick: () => add(dom, p("Button clicked!")) }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
      },
      tagsTest_escape: () => {
        assertEq(p("<input>").outerHTML, "<p>&lt;input&gt;</p>");
        assertEq(div2("a && b").outerHTML, "<div>a &amp;&amp; b</div>");
        assertEq(div2("<input a && b>").outerHTML, "<div>&lt;input a &amp;&amp; b&gt;</div>");
      },
      tagsTest_nestedChildren: () => {
        assertEq(ul([li("Item 1"), li("Item 2"), li("Item 3")]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
        assertEq(ul([[li("Item 1"), [li("Item 2")]], li("Item 3")]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
      },
      tagsTest_stateAsProp_connected: withHiddenDom(async (hiddenDom) => {
        const href = state("http://example.com/");
        const dom = a({ href }, "Test Link");
        add(hiddenDom, dom);
        assertEq(dom.href, "http://example.com/");
        href.val = "https://vanjs.org/";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "https://vanjs.org/");
      }),
      tagsTest_stateAsProp_disconnected: async () => {
        const href = state("http://example.com/");
        const dom = a({ href }, "Test Link");
        assertEq(dom.href, "http://example.com/");
        href.val = "https://vanjs.org/";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "http://example.com/");
      },
      tagsTest_stateAsOnClickHandler_connected: withHiddenDom(async (hiddenDom) => {
        const dom = div2();
        add(hiddenDom, dom);
        const handler = state(() => add(dom, p("Button clicked!")));
        add(dom, button({ onclick: handler }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        handler.val = () => add(dom, div2("Button clicked!"));
        await sleep(waitMsOnDomUpdates);
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>");
      }),
      tagsTest_stateAsOnClickHandler_disconnected: async () => {
        const dom = div2();
        const handler = state(() => add(dom, p("Button clicked!")));
        add(dom, button({ onclick: handler }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        handler.val = () => add(dom, div2("Button clicked!"));
        await sleep(waitMsOnDomUpdates);
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><p>Button clicked!</p></div>");
      },
      tagsTest_stateDerivedProp_connected: withHiddenDom(async (hiddenDom) => {
        const host = state("example.com");
        const path2 = state("/hello");
        const dom = a({ href: { deps: [host, path2], f: (host2, path3) => `https://${host2}${path3}` } }, "Test Link");
        add(hiddenDom, dom);
        assertEq(dom.href, "https://example.com/hello");
        host.val = "vanjs.org";
        path2.val = "/start";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "https://vanjs.org/start");
      }),
      tagsTest_stateDerivedProp_disconnected: async () => {
        const host = state("example.com");
        const path2 = state("/hello");
        const dom = a({ href: { deps: [host, path2], f: (host2, path3) => `https://${host2}${path3}` } }, "Test Link");
        assertEq(dom.href, "https://example.com/hello");
        host.val = "github.com";
        path2.val = "/alexander-xin/van/";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.href, "https://example.com/hello");
      },
      tagsTest_stateDerivedOnClickHandler_connected: withHiddenDom(async (hiddenDom) => {
        const dom = div2();
        add(hiddenDom, dom);
        const addPElement = state(true);
        add(dom, button({ onclick: {
          deps: [addPElement],
          f: (addPElement2) => addPElement2 ? () => add(dom, p("Button clicked!")) : () => add(dom, div2("Button clicked!"))
        } }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        addPElement.val = false;
        await sleep(waitMsOnDomUpdates);
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>");
      }),
      tagsTest_stateDerivedOnClickHandler_disconnected: async () => {
        const dom = div2();
        const addPElement = state(true);
        add(dom, button({ onclick: {
          deps: [addPElement],
          f: (addPElement2) => addPElement2 ? () => add(dom, p("Button clicked!")) : () => add(dom, div2("Button clicked!"))
        } }));
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
        addPElement.val = false;
        await sleep(waitMsOnDomUpdates);
        dom.querySelector("button").click();
        assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><p>Button clicked!</p></div>");
      },
      tagsTest_dataAttributes_connected: withHiddenDom(async (hiddenDom) => {
        const lineNum = state(1);
        const dom = div2({
          "data-type": "line",
          "data-id": lineNum,
          "data-line": { deps: [lineNum], f: (num) => `line=${num}` }
        }, "This is a test line");
        add(hiddenDom, dom);
        assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
        lineNum.val = 3;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, '<div data-type="line" data-id="3" data-line="line=3">This is a test line</div>');
      }),
      tagsTest_dataAttributes_disconnected: async () => {
        const lineNum = state(1);
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
      tagsTest_readonlyProps_connected: withHiddenDom(async (hiddenDom) => {
        const form = state("form1");
        const dom = button({ form }, "Button");
        add(hiddenDom, dom);
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        form.val = "form2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, '<button form="form2">Button</button>');
        assertEq(input({ list: "datalist1" }).outerHTML, '<input list="datalist1">');
      }),
      tagsTest_readonlyProps_disconnected: async () => {
        const form = state("form1");
        const dom = button({ form }, "Button");
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        form.val = "form2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, '<button form="form1">Button</button>');
        assertEq(input({ list: "datalist1" }).outerHTML, '<input list="datalist1">');
      },
      tagsTest_stateAsChild_connected: withHiddenDom(async (hiddenDom) => {
        const line2 = state("Line 2");
        const dom = div2(pre("Line 1"), pre(line2), pre("Line 3"));
        add(hiddenDom, dom);
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
      tagsTest_stateAsChild_disconnected: async () => {
        const line2 = state("Line 2");
        const dom = div2(pre("Line 1"), pre(line2), pre("Line 3"));
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = "Line 2: Extra Stuff";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = null;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
      },
      tagsTest_stateAsChild_emptyStrWontDeleteDom: withHiddenDom(async (hiddenDom) => {
        const text = state("Text");
        const dom = p(text);
        add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<p>Text</p>");
        text.val = "";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<p></p>");
        text.val = "Text";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<p>Text</p>");
      }),
      tagsNSTest_svg: () => {
        const { circle, path: path2, svg } = tagsNS("http://www.w3.org/2000/svg");
        const dom = svg({ width: "16px", viewBox: "0 0 50 50" }, circle({ cx: "25", cy: "25", "r": "20", stroke: "black", "stroke-width": "2", fill: "yellow" }), circle({ cx: "16", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black" }), circle({ cx: "34", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black" }), path2({ "d": "M 15 30 Q 25 40, 35 30", stroke: "black", "stroke-width": "2", fill: "transparent" }));
        assertEq(dom.outerHTML, '<svg width="16px" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" stroke="black" stroke-width="2" fill="yellow"></circle><circle cx="16" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><circle cx="34" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><path d="M 15 30 Q 25 40, 35 30" stroke="black" stroke-width="2" fill="transparent"></path></svg>');
      },
      tagsNSTest_math: () => {
        const { math, mi, mn, mo, mrow, msup } = tagsNS("http://www.w3.org/1998/Math/MathML");
        const dom = math(msup(mi("e"), mrow(mi("i"), mi("\u03C0"))), mo("+"), mn("1"), mo("="), mn("0"));
        assertEq(dom.outerHTML, "<math><msup><mi>e</mi><mrow><mi>i</mi><mi>\u03C0</mi></mrow></msup><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn></math>");
      },
      addTest_basic: () => {
        const dom = ul();
        assertEq(add(dom, li("Item 1"), li("Item 2")), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li></ul>");
        assertEq(add(dom, li("Item 3"), li("Item 4"), li("Item 5")), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
        assertEq(add(dom), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
      },
      addTest_nestedChildren: () => {
        const dom = ul();
        assertEq(add(dom, [li("Item 1"), li("Item 2")]), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li></ul>");
        assertEq(add(dom, [[li("Item 3"), [li("Item 4")]], li("Item 5")]), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
        assertEq(add(dom, [[[]]]), dom);
        assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
      },
      addTest_addState_connected: withHiddenDom(async (hiddenDom) => {
        const line2 = state("Line 2");
        assertEq(add(hiddenDom, pre("Line 1"), pre(line2), pre("Line 3")), hiddenDom);
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
      addTest_addState_disconnected: async () => {
        const line2 = state("Line 2");
        const dom = div2();
        assertEq(add(dom, pre("Line 1"), pre(line2), pre("Line 3")), dom);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = "Line 2: Extra Stuff";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        line2.val = null;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
      },
      stateTest_val: () => {
        const s = state("Init State");
        assertEq(s.val, "Init State");
        s.val = "Changed State";
        assertEq(s.val, "Changed State");
      },
      stateTest_onnew: () => {
        const history = [];
        const s = state("This");
        s.onnew((v, oldV) => history.push({ from: oldV, to: v }));
        s.val = "is";
        s.val = "a";
        s.val = "test";
        s.val = "test";
        assertEq(JSON.stringify(history), '[{"from":"This","to":"is"},{"from":"is","to":"a"},{"from":"a","to":"test"}]');
      },
      stateTest_derivedStates: () => {
        const numItems = state(0);
        const items = state([]);
        numItems.onnew((v) => items.val = [...Array(v).keys()].map((i) => `Item ${i + 1}`));
        const selectedIndex = state(0);
        items.onnew(() => selectedIndex.val = 0);
        const selectedItem = state("");
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
      bindTest_dynamicDom: withHiddenDom(async (hiddenDom) => {
        const verticalPlacement = state(false);
        const button1Text = state("Button 1"), button2Text = state("Button 2"), button3Text = state("Button 3");
        const dom = bind(verticalPlacement, (v) => v ? div2(div2(button(button1Text)), div2(button(button2Text)), div2(button(button3Text))) : div2(button(button1Text), button(button2Text), button(button3Text)));
        assertEq(add(hiddenDom, dom), hiddenDom);
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
      bindTest_statefulDynamicDom: withHiddenDom(async (hiddenDom) => {
        const numItems = state(0);
        const items = state([]);
        numItems.onnew((v) => items.val = [...Array(v).keys()].map((i) => `Item ${i + 1}`));
        const selectedIndex = state(0);
        items.onnew(() => selectedIndex.val = 0);
        const dom = bind(items, selectedIndex, (items2, selectedIndex2, dom2, oldItems, oldSelectedIndex) => {
          if (dom2 && items2 === oldItems) {
            const itemDoms = dom2.childNodes;
            itemDoms[oldSelectedIndex].classList.remove("selected");
            itemDoms[selectedIndex2].classList.add("selected");
            return dom2;
          }
          return ul(items2.map((item, i) => li({ class: i === selectedIndex2 ? "selected" : "" }, item)));
        });
        add(hiddenDom, dom);
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
      bindTest_nullToRemoveDom: withHiddenDom(async (hiddenDom) => {
        const line1 = state("Line 1"), line2 = state("Line 2"), line3 = state("Line 3");
        const dom = div2(bind(line1, (l) => l === "" ? null : p(l)), bind(line2, (l) => l === "" ? null : p(l)), p(line3));
        add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p></div>");
        line2.val = "";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p></div>");
        line2.val = "Line 2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p></div>");
        line3.val = null;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p></div>");
        line3.val = "Line 3";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p></div>");
      }),
      bindTest_undefinedToRemoveDom: withHiddenDom(async (hiddenDom) => {
        const line1 = state("Line 1"), line2 = state("Line 2"), line3 = state("Line 3");
        const dom = div2(bind(line1, (l) => l === "" ? void 0 : p(l)), bind(line2, (l) => l === "" ? void 0 : p(l)), p(line3));
        add(hiddenDom, dom);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p></div>");
        line2.val = "";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p></div>");
        line2.val = "Line 2";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p></div>");
        line3.val = void 0;
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p></div>");
        line3.val = "Line 3";
        await sleep(waitMsOnDomUpdates);
        assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p></div>");
      })
    };
    const debugTests = {
      tagsTest_invalidProp_nonFuncOnHandler: () => {
        const counter = state(0);
        assertError("Only functions are allowed", () => button({ onclick: ++counter.val }, "Increment"));
      },
      tagsTest_invalidProp_nonPrimitiveValue: () => {
        assertError(/Only.*are valid prop value types/, () => a({ href: null }));
        assertError(/Only.*are valid prop value types/, () => a({ href: void 0 }));
        assertError(/Only.*are valid prop value types/, () => a({ href: (x) => x * 2 }));
        assertError(/Only.*are valid prop value types/, () => a({ href: state({}) }));
        assertError(/Only.*are valid prop value types/, () => a({ href: state(null) }));
        assertError(/Only.*are valid prop value types/, () => a({ href: state(void 0) }));
        assertError(/Only.*are valid prop value types/, () => a({ href: state((x) => x * 2) }));
        const s = state(0);
        assertError(/Only.*are valid prop value types/, () => a({ href: { deps: [s], f: () => {
        } } }));
        assertError(/Only.*are valid prop value types/, () => a({ href: { deps: [s], f: () => null } }));
        assertError(/Only.*are valid prop value types/, () => a({ href: { deps: [s], f: () => void 0 } }));
        assertError(/Only.*are valid prop value types/, () => a({ href: { deps: [s], f: () => (x) => x * 2 } }));
      },
      tagsTest_invalidChild: () => {
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), {}, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), null, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), void 0, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), (x) => x * 2, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), state({}), p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), state(null), p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), state(void 0), p()));
        assertError(/Only.*are valid child of a DOM Node/, () => div2(div2(), state((x) => x * 2), p()));
      },
      tagsTest_alreadyConnectedChild: withHiddenDom((hiddenDom) => {
        const dom = p();
        add(hiddenDom, dom);
        assertError("already connected to document", () => div2(p(), dom, p()));
      }),
      tagsNSTest_invalidNs: () => {
        assertError("Must provide a string", () => tagsNS(1));
        assertError("Must provide a string", () => tagsNS(null));
        assertError("Must provide a string", () => tagsNS(void 0));
        assertError("Must provide a string", () => tagsNS({}));
        assertError("Must provide a string", () => tagsNS((x) => x * 2));
      },
      addTest_1stArgNotDom: () => {
        assertError("1st argument of `add` function must be a DOM Node object", () => add({}, div2()));
      },
      addTest_invalidChild: () => {
        const dom = div2();
        assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div2(), {}, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div2(), null, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div2(), void 0, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div2(), (x) => x * 2, p()));
        assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div2(), state({}), p()));
        assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div2(), state(null), p()));
        assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div2(), state(void 0), p()));
        assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div2(), state((x) => x * 2), p()));
      },
      addTest_alreadyConnectedChild: withHiddenDom((hiddenDom) => {
        const dom = div2();
        add(hiddenDom, dom);
        assertError("already connected to document", () => add(hiddenDom, dom));
      }),
      stateTest_invalidInitialVal: () => {
        assertError("DOM Node is not valid", () => state(document));
        assertError("couldn't have value to other state", () => state(state(0)));
      },
      stateTest_invalidValSet: () => {
        const s = state(0);
        assertError("DOM Node is not valid", () => s.val = document);
        assertError("couldn't have value to other state", () => s.val = state(0));
      },
      stateTest_nonFunctionOnnewListener: () => {
        const s = state(0);
        let t2 = 0;
        assertError("You should pass-in functions to register `onnew` handlers", () => s.onnew(++t2));
      },
      stateTest_mutatingVal: () => {
        {
          const t2 = state({ a: 2 });
          assertError("Cannot assign to read only property 'a'", () => t2.val.a = 3);
        }
        {
          const t2 = state({ b: 1 });
          t2.val = { b: 2 };
          assertError("Cannot assign to read only property 'b'", () => t2.val.b = 3);
        }
      },
      bindTest_noStates: () => {
        assertError("1 or more states", () => bind());
        assertError("1 or more states", () => bind((x) => x * 2));
      },
      bindTest_nonStateArgs: () => {
        assertError("must be states", () => bind(state(0), "", state(""), (a2, b, c) => a2 + b + c));
        const s = state([]);
        assertError("must be states", () => bind(s.val, (s2) => s2.length));
      },
      bindTest_lastArgNotFunc: () => assertError("must be the generation function", () => bind(state(0), state(1))),
      bindTest_invalidInitialResult: () => {
        const s = state(0);
        assertError("must be DOM node, primitive, null or undefined", () => bind(s, () => ({})));
        assertError("must be DOM node, primitive, null or undefined", () => bind(s, () => (x) => x * 2));
      },
      bindTest_invalidFollowupResult: withHiddenDom(async (hiddenDom) => {
        const s = state(1);
        add(hiddenDom, bind(s, (s2) => s2 || {}), bind(s, (s2) => s2 || ((x) => x * 2)));
        await capturingErrors(async () => {
          s.val = 0;
          await sleep(waitMsOnDomUpdates);
          assert(vanObj.capturedErrors.length === 2 && vanObj.capturedErrors.every((e) => e.includes("must be DOM node, primitive, null or undefined")));
        });
      }),
      bindTest_derivedDom_domResultAlreadyConnected: withHiddenDom(async (hiddenDom) => {
        const dom = div2();
        add(hiddenDom, dom);
        const num = state(1);
        add(hiddenDom, bind(num, (num2, prevDom) => {
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
          assert(vanObj.capturedErrors[0].includes("it shouldn't be already connected to document"));
        });
      })
    };
    const examples = {
      counter: withHiddenDom(async (hiddenDom) => {
        const Counter = () => {
          const counter = state(0);
          return div2(div2("\u2764\uFE0F: ", counter), button({ onclick: () => ++counter.val }, "\u{1F44D}"), button({ onclick: () => --counter.val }, "\u{1F44E}"));
        };
        add(hiddenDom, Counter());
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
        const counter = state(1);
        counter.onnew((v, oldV) => console.log(`Counter: ${oldV} -> ${v}`));
        const dom1 = div2(counter);
        const dom2 = input({ type: "number", value: counter, disabled: true });
        const dom3 = div2({ style: { deps: [counter], f: (c) => `font-size: ${c}em;` } }, "Text");
        const dom4 = div2(bind(counter, (c) => `${c}^2 = ${c * c}`));
        const incrementBtn = button({ onclick: () => ++counter.val }, "Increment");
        const resetBtn = button({ onclick: () => counter.val = 1 }, "Reset");
        add(hiddenDom, incrementBtn, resetBtn, dom1, dom2, dom3, dom4);
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
          const value = state("");
          return span(input({ type: "text", value, oninput: (e) => value.val = e.target.value }), input({ type: "text", value, oninput: (e) => value.val = e.target.value }));
        };
        add(hiddenDom, ConnectedProps());
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
          const size = state(16), color = state("black");
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
        add(hiddenDom, FontPreview());
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
          const items = state("a,b,c"), sortedBy = state("Ascending");
          return span("Comma-separated list: ", input({
            oninput: (e) => items.val = e.target.value,
            type: "text",
            value: items
          }), " ", select({ oninput: (e) => sortedBy.val = e.target.value, value: sortedBy }, option({ value: "Ascending" }, "Ascending"), option({ value: "Descending" }, "Descending")), bind(items, sortedBy, (items2, sortedBy2) => sortedBy2 === "Ascending" ? ul(items2.split(",").sort().map((i) => li(i))) : ul(items2.split(",").sort().reverse().map((i) => li(i)))));
        };
        add(hiddenDom, SortedList());
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
          const deleted = state(false);
          return bind(deleted, (d) => d ? null : li(text, a({ onclick: () => deleted.val = true }, "\u274C")));
        };
        const EditableList = () => {
          const listDom = ul();
          const textDom = input({ type: "text" });
          return div2(textDom, " ", button({
            onclick: () => add(listDom, ListItem({ text: textDom.value }))
          }, "\u2795"), listDom);
        };
        add(hiddenDom, EditableList());
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
        const renderPre = state(false);
        const text = state("Text");
        const TextLine = (renderPre2) => (renderPre2 ? pre : div2)(bind(text, (t2) => `--${t2}--`));
        const dom = div2(bind(renderPre, TextLine));
        add(hiddenDom, dom);
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
        const result = state("");
        const msg = state("");
        add(msgDom2, div2(pre(`Running ${k}.${name}...`), pre(result), pre(" "), pre(button({ onclick: async () => {
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
          add(msgDom2, div2({ style: "color: red" }, "Test failed, please check console for error message."));
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
