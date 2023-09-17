window.numTests = 0;
const runTests = async (van, msgDom, { debug }) => {
    const { a, b, button, div, h2, input, li, option, p, pre, select, span, sup, table, tbody, td, th, thead, tr, ul } = van.tags;
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
        }
        catch (e) {
            if (msg instanceof RegExp) {
                if (msg.test(e.toString()))
                    caught = true;
                else
                    throw e;
            }
            else {
                if (e.toString().includes(msg))
                    caught = true;
                else
                    throw e;
            }
        }
        if (!caught)
            throw new Error(`Expected error with message "${msg}" being thrown.`);
    };
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const waitMsOnDomUpdates = 5;
    const withHiddenDom = (func) => async () => {
        const dom = div({ class: "hidden" });
        van.add(document.body, dom);
        try {
            await func(dom);
        }
        finally {
            dom.remove();
        }
    };
    const capturingErrors = async (msg, numErrors, func) => {
        van.startCapturingErrors();
        try {
            await func();
            assert(van.capturedErrors.length === numErrors && van.capturedErrors.every(e => msg instanceof RegExp ? msg.test(e.toString()) : e.toString().includes(msg)));
        }
        finally {
            van.stopCapturingErrors();
        }
    };
    const tests = {
        tags_basic: () => {
            const dom = div(p("👋Hello"), ul(li("🗺️World"), li(a({ href: "https://vanjs.org/" }, "🍦VanJS"))));
            assertEq(dom.outerHTML, '<div><p>👋Hello</p><ul><li>🗺️World</li><li><a href="https://vanjs.org/">🍦VanJS</a></li></ul></div>');
        },
        tags_onclickHandler: () => {
            {
                const dom = div(button({ onclick: () => van.add(dom, p("Button clicked!")) }));
                dom.querySelector("button").click();
                assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
            }
            {
                // Use `onClick` instead of `onclick` so that attribute instead of property will be set.
                const dom = div(button({ onClick: 'alert("Hello")' }, "Click me"));
                assertEq(dom.outerHTML, '<div><button onclick="alert(&quot;Hello&quot;)">Click me</button></div>');
            }
        },
        tags_escape: () => {
            assertEq(p("<input>").outerHTML, "<p>&lt;input&gt;</p>");
            assertEq(div("a && b").outerHTML, "<div>a &amp;&amp; b</div>");
            assertEq(div("<input a && b>").outerHTML, "<div>&lt;input a &amp;&amp; b&gt;</div>");
        },
        tags_nestedChildren: () => {
            assertEq(ul([li("Item 1"), li("Item 2"), li("Item 3")]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
            // Deeply nested
            assertEq(ul([[li("Item 1"), [li("Item 2")]], li("Item 3")]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
        },
        tags_nullOrUndefinedAreIgnored: () => {
            assertEq(ul(li("Item 1"), li("Item 2"), undefined, li("Item 3"), null).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
            assertEq(ul([li("Item 1"), li("Item 2"), undefined, li("Item 3"), null]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
            // Deeply nested
            assertEq(ul([[undefined, li("Item 1"), null, [li("Item 2")]], null, li("Item 3"), undefined]).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
        },
        tags_nullPropValue: () => {
            const dom = button({ onclick: null });
            assert(dom.onclick === null);
        },
        tags_stateAsProp_connected: withHiddenDom(async (hiddenDom) => {
            const href = van.state("http://example.com/");
            const dom = a({ href }, "Test Link");
            van.add(hiddenDom, dom);
            assertEq(dom.href, "http://example.com/");
            href.val = "https://vanjs.org/";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.href, "https://vanjs.org/");
        }),
        tags_stateAsProp_disconnected: async () => {
            const href = van.state("http://example.com/");
            const dom = a({ href }, "Test Link");
            assertEq(dom.href, "http://example.com/");
            href.val = "https://vanjs.org/";
            await sleep(waitMsOnDomUpdates);
            // href won't change as dom is not connected to document
            assertEq(dom.href, "http://example.com/");
        },
        tags_stateAsOnclickHandler_connected: withHiddenDom(async (hiddenDom) => {
            const dom = div();
            van.add(hiddenDom, dom);
            const handler = van.state((() => van.add(dom, p("Button clicked!"))));
            van.add(dom, button({ onclick: handler }));
            dom.querySelector("button").click();
            assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
            handler.val = () => van.add(dom, div("Button clicked!"));
            await sleep(waitMsOnDomUpdates);
            dom.querySelector("button").click();
            assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>");
            handler.val = null;
            await sleep(waitMsOnDomUpdates);
            dom.querySelector("button").click();
            assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>");
        }),
        tags_stateAsOnclickHandler_disconnected: async () => {
            const dom = div();
            const handler = van.state(() => van.add(dom, p("Button clicked!")));
            van.add(dom, button({ onclick: handler }));
            dom.querySelector("button").click();
            assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>");
            handler.val = () => van.add(dom, div("Button clicked!"));
            await sleep(waitMsOnDomUpdates);
            dom.querySelector("button").click();
            // The onclick handler won't change as dom is not connected to document, as a result, the <p> element will be added
            assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><p>Button clicked!</p></div>");
        },
        tags_stateDerivedProp_connected: withHiddenDom(async (hiddenDom) => {
            const host = van.state("example.com");
            const path = van.state("/hello");
            const dom = a({ href: () => `https://${host.val}${path.val}` }, "Test Link");
            van.add(hiddenDom, dom);
            assertEq(dom.href, "https://example.com/hello");
            host.val = "vanjs.org";
            path.val = "/start";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.href, "https://vanjs.org/start");
        }),
        tags_stateDerivedProp_disconnected: async () => {
            const host = van.state("example.com");
            const path = van.state("/hello");
            const dom = a({ href: () => `https://${host.val}${path.val}` }, "Test Link");
            assertEq(dom.href, "https://example.com/hello");
            host.val = "vanjs.org";
            path.val = "/start";
            await sleep(waitMsOnDomUpdates);
            // href won't change as dom is not connected to document
            assertEq(dom.href, "https://example.com/hello");
        },
        tags_stateDerivedProp_nonStateDeps_connected: withHiddenDom(async (hiddenDom) => {
            const host = van.state("example.com");
            const path = "/hello";
            const dom = a({ href: () => `https://${van.val(host)}${van.val(path)}` }, "Test Link");
            van.add(hiddenDom, dom);
            assertEq(dom.href, "https://example.com/hello");
            host.val = "vanjs.org";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.href, "https://vanjs.org/hello");
        }),
        tags_stateDerivedProp_nonStateDeps_disconnected: async () => {
            const host = van.state("example.com");
            const path = "/hello";
            const dom = a({ href: () => `https://${van.val(host)}${van.val(path)}` }, "Test Link");
            assertEq(dom.href, "https://example.com/hello");
            host.val = "vanjs.org";
            await sleep(waitMsOnDomUpdates);
            // href won't change as dom is not connected to document
            assertEq(dom.href, "https://example.com/hello");
        },
        tags_stateDerivedProp_oldVal_connected: withHiddenDom(async (hiddenDom) => {
            const text = van.state("Old Text");
            const dom = input({ type: "text", value: () => `From: "${van.oldVal(text)}" to: "${van.val(text)}"` });
            van.add(hiddenDom, dom);
            assertEq(dom.value, 'From: "Old Text" to: "Old Text"');
            text.val = "New Text";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.value, 'From: "Old Text" to: "New Text"');
        }),
        tags_stateDerivedProp_oldVal_disconnected: async () => {
            const text = van.state("Old Text");
            const dom = input({ type: "text", value: () => `From: "${van.oldVal(text)}" to: "${van.val(text)}"` });
            assertEq(dom.value, 'From: "Old Text" to: "Old Text"');
            text.val = "New Text";
            await sleep(waitMsOnDomUpdates);
            // value won't change as dom is not connected to document
            assertEq(dom.value, 'From: "Old Text" to: "Old Text"');
        },
        tags_stateDerivedProp_errorThrown_connected: withHiddenDom(async (hiddenDom) => {
            const text = van.state("hello");
            const dom = div(div({
                class: () => {
                    if (text.val === "fail")
                        throw new Error();
                    return text.val;
                },
                "data-name": text,
            }, text), div({
                class: () => {
                    if (text.val === "fail")
                        throw new Error();
                    return text.val;
                },
                "data-name": text,
            }, text));
            van.add(hiddenDom, dom);
            assertEq(dom.outerHTML, '<div><div class="hello" data-name="hello">hello</div><div class="hello" data-name="hello">hello</div></div>');
            text.val = "fail";
            await sleep(waitMsOnDomUpdates);
            // The binding function for `class` property throws an error.
            // We want to validate the `class` property won't be updated because of the error,
            // but other properties and child nodes are updated as usual.
            assertEq(dom.outerHTML, '<div><div class="hello" data-name="fail">fail</div><div class="hello" data-name="fail">fail</div></div>');
        }),
        tags_stateDerivedProp_errorThrown_disconnected: async () => {
            const text = van.state("hello");
            const dom = div(div({
                class: () => {
                    if (text.val === "fail")
                        throw new Error();
                    return text.val;
                },
                "data-name": text,
            }, text), div({
                class: () => {
                    if (text.val === "fail")
                        throw new Error();
                    return text.val;
                },
                "data-name": text,
            }, text));
            assertEq(dom.outerHTML, '<div><div class="hello" data-name="hello">hello</div><div class="hello" data-name="hello">hello</div></div>');
            text.val = "fail";
            await sleep(waitMsOnDomUpdates);
            // `dom` won't change as it's not connected to document
            assertEq(dom.outerHTML, '<div><div class="hello" data-name="hello">hello</div><div class="hello" data-name="hello">hello</div></div>');
        },
        tags_stateDerivedOnclickHandler_connected: withHiddenDom(async (hiddenDom) => {
            const elementName = van.state("p");
            van.add(hiddenDom, button({
                onclick: van._(() => {
                    const name = elementName.val;
                    return name ? () => van.add(hiddenDom, van.tags[name]("Button clicked!")) : null;
                }),
            }));
            hiddenDom.querySelector("button").click();
            assertEq(hiddenDom.innerHTML, "<button></button><p>Button clicked!</p>");
            elementName.val = "div";
            await sleep(waitMsOnDomUpdates);
            hiddenDom.querySelector("button").click();
            assertEq(hiddenDom.innerHTML, "<button></button><p>Button clicked!</p><div>Button clicked!</div>");
            elementName.val = "";
            await sleep(waitMsOnDomUpdates);
            hiddenDom.querySelector("button").click();
            assertEq(hiddenDom.innerHTML, "<button></button><p>Button clicked!</p><div>Button clicked!</div>");
        }),
        tags_stateDerivedOnclickHandler_disconnected: async () => {
            const dom = div();
            const elementName = van.state("p");
            van.add(dom, button({
                onclick: van._(() => {
                    const name = elementName.val;
                    return name ? () => van.add(dom, van.tags[name]("Button clicked!")) : null;
                }),
            }));
            dom.querySelector("button").click();
            assertEq(dom.innerHTML, "<button></button><p>Button clicked!</p>");
            elementName.val = "div";
            await sleep(waitMsOnDomUpdates);
            // The onclick handler won't change as `dom` is not connected to document,
            // as a result, the <p> element will be added.
            dom.querySelector("button").click();
            assertEq(dom.innerHTML, "<button></button><p>Button clicked!</p><p>Button clicked!</p>");
        },
        tags_dataAttributes_connected: withHiddenDom(async (hiddenDom) => {
            const lineNum = van.state(1);
            const dom = div({
                "data-type": "line",
                "data-id": lineNum,
                "data-line": () => `line=${lineNum.val}`,
            }, "This is a test line");
            van.add(hiddenDom, dom);
            assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
            lineNum.val = 3;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, '<div data-type="line" data-id="3" data-line="line=3">This is a test line</div>');
        }),
        tags_dataAttributes_disconnected: async () => {
            const lineNum = van.state(1);
            const dom = div({
                "data-type": "line",
                "data-id": lineNum,
                "data-line": () => `line=${lineNum.val}`,
            }, "This is a test line");
            assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
            lineNum.val = 3;
            await sleep(waitMsOnDomUpdates);
            // Attributes won't change as dom is not connected to document
            assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>');
        },
        tags_readonlyProps_connected: withHiddenDom(async (hiddenDom) => {
            const form = van.state("form1");
            const dom = button({ form }, "Button");
            van.add(hiddenDom, dom);
            assertEq(dom.outerHTML, '<button form="form1">Button</button>');
            form.val = "form2";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, '<button form="form2">Button</button>');
            assertEq(input({ list: "datalist1" }).outerHTML, '<input list="datalist1">');
        }),
        tags_readonlyProps_disconnected: async () => {
            const form = van.state("form1");
            const dom = button({ form }, "Button");
            assertEq(dom.outerHTML, '<button form="form1">Button</button>');
            form.val = "form2";
            await sleep(waitMsOnDomUpdates);
            // Attributes won't change as dom is not connected to document
            assertEq(dom.outerHTML, '<button form="form1">Button</button>');
            assertEq(input({ list: "datalist1" }).outerHTML, '<input list="datalist1">');
        },
        tags_stateAsChild_connected: withHiddenDom(async (hiddenDom) => {
            const line2 = van.state("Line 2");
            const dom = div(pre("Line 1"), pre(line2), pre("Line 3"));
            van.add(hiddenDom, dom);
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
            line2.val = "Line 2: Extra Stuff";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2: Extra Stuff</pre><pre>Line 3</pre></div>");
            // null to remove text DOM
            line2.val = null;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>");
            // Resetting the state won't bring the text DOM back
            line2.val = "Line 2";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>");
        }),
        tags_stateAsChild_disconnected: async () => {
            const line2 = van.state("Line 2");
            const dom = div(pre("Line 1"), pre(line2), pre("Line 3"));
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
            line2.val = "Line 2: Extra Stuff";
            await sleep(waitMsOnDomUpdates);
            // Content won't change as dom is not connected to document
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
            line2.val = null;
            await sleep(waitMsOnDomUpdates);
            // Content won't change as dom is not connected to document
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        },
        tags_stateAsChild_emptyStrWontDeleteDom: withHiddenDom(async (hiddenDom) => {
            const text = van.state("Text");
            const dom = p(text);
            van.add(hiddenDom, dom);
            assertEq(dom.outerHTML, "<p>Text</p>");
            text.val = "";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<p></p>");
            text.val = "Text";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<p>Text</p>");
        }),
        tagsNS_svg: () => {
            const { circle, path, svg } = van.tagsNS("http://www.w3.org/2000/svg");
            const dom = svg({ width: "16px", viewBox: "0 0 50 50" }, circle({ cx: "25", cy: "25", "r": "20", stroke: "black", "stroke-width": "2", fill: "yellow" }), circle({ cx: "16", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black" }), circle({ cx: "34", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black" }), path({ "d": "M 15 30 Q 25 40, 35 30", stroke: "black", "stroke-width": "2", fill: "transparent" }));
            assertEq(dom.outerHTML, '<svg width="16px" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" stroke="black" stroke-width="2" fill="yellow"></circle><circle cx="16" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><circle cx="34" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><path d="M 15 30 Q 25 40, 35 30" stroke="black" stroke-width="2" fill="transparent"></path></svg>');
        },
        tagsNS_math: () => {
            const { math, mi, mn, mo, mrow, msup } = van.tagsNS("http://www.w3.org/1998/Math/MathML");
            const dom = math(msup(mi("e"), mrow(mi("i"), mi("π"))), mo("+"), mn("1"), mo("="), mn("0"));
            assertEq(dom.outerHTML, '<math><msup><mi>e</mi><mrow><mi>i</mi><mi>π</mi></mrow></msup><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn></math>');
        },
        add_basic: () => {
            const dom = ul();
            assertEq(van.add(dom, li("Item 1"), li("Item 2")), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li></ul>");
            assertEq(van.add(dom, li("Item 3"), li("Item 4"), li("Item 5")), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
            // No-op if no children specified
            assertEq(van.add(dom), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
        },
        add_nestedChildren: () => {
            const dom = ul();
            assertEq(van.add(dom, [li("Item 1"), li("Item 2")]), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li></ul>");
            // Deeply nested
            assertEq(van.add(dom, [[li("Item 3"), [li("Item 4")]], li("Item 5")]), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
            // No-op if no children specified
            assertEq(van.add(dom, [[[]]]), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>");
        },
        add_nullOrUndefinedAreIgnored: () => {
            const dom = ul();
            assertEq(van.add(dom, li("Item 1"), li("Item 2"), undefined, li("Item 3"), null), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
            assertEq(van.add(dom, [li("Item 4"), li("Item 5"), undefined, li("Item 6"), null]), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>");
            // Deeply nested
            assertEq(van.add(dom, [[undefined, li("Item 7"), null, [li("Item 8")]], null, li("Item 9"), undefined]), dom);
            assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li><li>Item 7</li><li>Item 8</li><li>Item 9</li></ul>");
        },
        add_addState_connected: withHiddenDom(async (hiddenDom) => {
            const line2 = van.state("Line 2");
            assertEq(van.add(hiddenDom, pre("Line 1"), pre(line2), pre("Line 3")), hiddenDom);
            assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>');
            line2.val = "Line 2: Extra Stuff";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre>Line 2: Extra Stuff</pre><pre>Line 3</pre></div>');
            // null to remove text DOM
            line2.val = null;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>');
            // Resetting the state won't bring the text DOM back
            line2.val = "Line 2";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>');
        }),
        add_addState_disconnected: async () => {
            const line2 = van.state("Line 2");
            const dom = div();
            assertEq(van.add(dom, pre("Line 1"), pre(line2), pre("Line 3")), dom);
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
            line2.val = "Line 2: Extra Stuff";
            await sleep(waitMsOnDomUpdates);
            // Content won't change as dom is not connected to document
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
            line2.val = null;
            await sleep(waitMsOnDomUpdates);
            // Content won't change as dom is not connected to document
            assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>");
        },
        state_valAndOldVal: withHiddenDom(async (hiddenDom) => {
            const s = van.state("State Version 1");
            assertEq(s.val, "State Version 1");
            assertEq(s.oldVal, "State Version 1");
            // If the state object doesn't have any bindings, we directly update the `oldVal`
            s.val = "State Version 2";
            assertEq(s.val, "State Version 2");
            assertEq(s.oldVal, "State Version 2");
            van.add(hiddenDom, s);
            // If the state object has some bindings, `oldVal` refers to its old value until DOM update completes
            s.val = "State Version 3";
            assertEq(s.val, "State Version 3");
            assertEq(s.oldVal, "State Version 2");
            await sleep(waitMsOnDomUpdates);
            assertEq(s.val, "State Version 3");
            assertEq(s.oldVal, "State Version 3");
        }),
        derive_sideEffect: () => {
            const history = [];
            const s = van.state("This");
            van.derive(() => history.push(s.val));
            s.val = "is";
            s.val = "a";
            s.val = "test";
            s.val = "test";
            assertEq(JSON.stringify(history), '["This","is","a","test"]');
        },
        derive_derivedState: () => {
            const numItems = van.state(0);
            const items = van.derive(() => [...Array(numItems.val).keys()].map(i => `Item ${i + 1}`));
            const selectedIndex = van.derive(() => (items.val, 0));
            const selectedItem = van.derive(() => items.val[selectedIndex.val]);
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
        derive_conditionalDerivedState: () => {
            const cond = van.state(true);
            const a = van.state(1), b = van.state(2), c = van.state(3), d = van.state(4);
            let numEffectTriggered = 0;
            const sum = van.derive(() => (++numEffectTriggered, cond.val ? a.val + b.val : c.val + d.val));
            assertEq(sum.val, 3);
            assertEq(numEffectTriggered, 1);
            a.val = 11;
            assertEq(sum.val, 13);
            assertEq(numEffectTriggered, 2);
            b.val = 12;
            assertEq(sum.val, 23);
            assertEq(numEffectTriggered, 3);
            // Changing c or d won't triggered the effect as they're not its current dependencies
            c.val = 13;
            assertEq(sum.val, 23);
            assertEq(numEffectTriggered, 3);
            d.val = 14;
            assertEq(sum.val, 23);
            assertEq(numEffectTriggered, 3);
            cond.val = false;
            assertEq(sum.val, 27);
            assertEq(numEffectTriggered, 4);
            c.val = 23;
            assertEq(sum.val, 37);
            assertEq(numEffectTriggered, 5);
            d.val = 24;
            assertEq(sum.val, 47);
            assertEq(numEffectTriggered, 6);
            // Changing a or b won't triggered the effect as they're not its current dependencies
            a.val = 21;
            assertEq(sum.val, 47);
            assertEq(numEffectTriggered, 6);
            b.val = 22;
            assertEq(sum.val, 47);
            assertEq(numEffectTriggered, 6);
        },
        derive_errorThrown: () => {
            const s0 = van.state(1);
            const s1 = van.derive(() => s0.val * 2);
            const s2 = van.derive(() => {
                if (s0.val > 1)
                    throw new Error();
                return s0.val;
            });
            const s3 = van.derive(() => s0.val * s0.val);
            assertEq(s1.val, 2);
            assertEq(s2.val, 1);
            assertEq(s3.val, 1);
            s0.val = 3;
            // The derivation function for `s2` throws an error.
            // We want to validate the `val` of `s2` becomes `undefined` because of the error,
            // but other derived states are updated as usual.
            assertEq(s1.val, 6);
            assertEq(s2.val, undefined);
            assertEq(s3.val, 9);
        },
        stateDerivedChild_dynamicDom: withHiddenDom(async (hiddenDom) => {
            const verticalPlacement = van.state(false);
            const button1Text = van.state("Button 1"), button2Text = van.state("Button 2"), button3Text = van.state("Button 3");
            const domFunc = () => verticalPlacement.val ? div(div(button(button1Text)), div(button(button2Text)), div(button(button3Text))) : div(button(button1Text), button(button2Text), button(button3Text));
            assertEq(van.add(hiddenDom, domFunc), hiddenDom);
            const dom = hiddenDom.firstChild;
            assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2</button><button>Button 3</button></div>");
            button2Text.val = "Button 2: Extra";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
            verticalPlacement.val = true;
            await sleep(waitMsOnDomUpdates);
            // dom is disconnected from the document thus it won't be updated
            assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
            assertEq(hiddenDom.firstChild.outerHTML, "<div><div><button>Button 1</button></div><div><button>Button 2: Extra</button></div><div><button>Button 3</button></div></div>");
            button2Text.val = "Button 2: Extra Extra";
            await sleep(waitMsOnDomUpdates);
            // Since dom is disconnected from document, its inner button won't be reactive to state changes
            assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>");
            assertEq(hiddenDom.firstChild.outerHTML, "<div><div><button>Button 1</button></div><div><button>Button 2: Extra Extra</button></div><div><button>Button 3</button></div></div>");
        }),
        stateDerivedChild_conditionalDomFunc: withHiddenDom(async (hiddenDom) => {
            const cond = van.state(true);
            const button1 = van.state("Button 1"), button2 = van.state("Button 2");
            const button3 = van.state("Button 3"), button4 = van.state("Button 4");
            let numFuncCalled = 0;
            const domFunc = () => (++numFuncCalled, cond.val ?
                div(button(button1.val), button(button2.val)) :
                div(button(button3.val), button(button4.val)));
            assertEq(van.add(hiddenDom, domFunc), hiddenDom);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1</button><button>Button 2</button></div>");
            assertEq(numFuncCalled, 1);
            button1.val = "Button 1-1";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1-1</button><button>Button 2</button></div>");
            assertEq(numFuncCalled, 2);
            button2.val = "Button 2-1";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1-1</button><button>Button 2-1</button></div>");
            assertEq(numFuncCalled, 3);
            // Changing button3 or button4 won't triggered the effect as they're not its current dependencies
            button3.val = "Button 3-1";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1-1</button><button>Button 2-1</button></div>");
            assertEq(numFuncCalled, 3);
            button4.val = "Button 4-1";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 1-1</button><button>Button 2-1</button></div>");
            assertEq(numFuncCalled, 3);
            cond.val = false;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-1</button><button>Button 4-1</button></div>");
            assertEq(numFuncCalled, 4);
            button3.val = "Button 3-2";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-2</button><button>Button 4-1</button></div>");
            assertEq(numFuncCalled, 5);
            button4.val = "Button 4-2";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-2</button><button>Button 4-2</button></div>");
            assertEq(numFuncCalled, 6);
            // Changing button1 or button2 won't triggered the effect as they're not its current dependencies
            button1.val = "Button 1-2";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-2</button><button>Button 4-2</button></div>");
            assertEq(numFuncCalled, 6);
            button1.val = "Button 2-2";
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, "<div><button>Button 3-2</button><button>Button 4-2</button></div>");
            assertEq(numFuncCalled, 6);
        }),
        stateDerivedChild_statefulDynamicDom: withHiddenDom(async (hiddenDom) => {
            const numItems = van.state(0);
            const items = van.derive(() => [...Array(numItems.val).keys()].map(i => `Item ${i + 1}`));
            const selectedIndex = van.derive(() => (items.val, 0));
            const domFunc = (dom) => {
                // If items aren't changed, we don't need to regenerate the entire dom
                if (dom && items.val === items.oldVal) {
                    const itemDoms = dom.childNodes;
                    itemDoms[selectedIndex.oldVal].classList.remove("selected");
                    itemDoms[selectedIndex.val].classList.add("selected");
                    return dom;
                }
                return ul(items.val.map((item, i) => li({ class: i === selectedIndex.val ? "selected" : "" }, item)));
            };
            van.add(hiddenDom, domFunc);
            numItems.val = 3;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="selected">Item 1</li><li class="">Item 2</li><li class="">Item 3</li></ul>');
            const rootDom1stIteration = hiddenDom.firstChild;
            selectedIndex.val = 1;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
            // Items aren't changed, thus we don't need to regenerate the dom
            assertEq(hiddenDom.firstChild, rootDom1stIteration);
            numItems.val = 5;
            await sleep(waitMsOnDomUpdates);
            // Items are changed, thus the dom for the list is regenerated
            assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="selected">Item 1</li><li class="">Item 2</li><li class="">Item 3</li><li class="">Item 4</li><li class="">Item 5</li></ul>');
            assert(hiddenDom.firstChild !== rootDom1stIteration);
            // rootDom1stIteration is disconnected from the document and remain unchanged
            assertEq(rootDom1stIteration.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
            const rootDom2ndIteration = hiddenDom.firstChild;
            selectedIndex.val = 2;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, '<ul><li class="">Item 1</li><li class="">Item 2</li><li class="selected">Item 3</li><li class="">Item 4</li><li class="">Item 5</li></ul>');
            // Items aren't changed, thus we don't need to regenerate the dom
            assertEq(hiddenDom.firstChild, rootDom2ndIteration);
            // rootDom1stIteration won't be updated as it has already been disconnected from the document
            assertEq(rootDom1stIteration.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>');
        }),
        stateDerivedChild_nullToRemoveDom: withHiddenDom(async (hiddenDom) => {
            const line1 = van.state("Line 1"), line2 = van.state("Line 2"), line3 = van.state("Line 3"), line4 = van.state(""), line5 = van.state(null);
            const dom = div(() => line1.val === "" ? null : p(line1.val), () => line2.val === "" ? null : p(line2.val), p(line3), 
            // line4 won't appear in the DOM tree as its initial value is null
            () => line4.val === "" ? null : p(line4.val), 
            // line5 won't appear in the DOM tree as its initial value is null
            p(line5));
            van.add(hiddenDom, dom);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p><p></p></div>");
            // Delete Line 2
            line2.val = "";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
            // Deleted dom won't be brought back, even the underlying state is changed back
            line2.val = "Line 2";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
            // Delete Line 3
            line3.val = null;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
            // Deleted dom won't be brought back, even the underlying state is changed back
            line3.val = "Line 3";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
        }),
        stateDerivedChild_undefinedToRemoveDom: withHiddenDom(async (hiddenDom) => {
            const line1 = van.state("Line 1"), line2 = van.state("Line 2"), line3 = van.state("Line 3"), line4 = van.state(""), line5 = van.state(undefined);
            const dom = div(() => line1.val === "" ? null : p(line1.val), () => line2.val === "" ? null : p(line2.val), p(line3), 
            // line4 won't appear in the DOM tree as its initial value is null
            () => line4.val === "" ? null : p(line4.val), 
            // line5 won't appear in the DOM tree as its initial value is null
            p(line5));
            van.add(hiddenDom, dom);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p><p></p></div>");
            // Delete Line 2
            line2.val = "";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
            // Deleted dom won't be brought back, even the underlying state is changed back
            line2.val = "Line 2";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p><p></p></div>");
            // Delete Line 3
            line3.val = undefined;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
            // Deleted dom won't be brought back, even the underlying state is changed back
            line3.val = "Line 3";
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p><p></p></div>");
        }),
        stateDerivedChild_0ToNotRemoveDom: withHiddenDom(async (hiddenDom) => {
            const state1 = van.state(0), state2 = van.state(1);
            const dom = div(state1, () => 1 - state1.val, state2, () => 1 - state2.val);
            van.add(hiddenDom, dom);
            assertEq(dom.outerHTML, "<div>0110</div>");
            state1.val = 1, state2.val = 0;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div>1001</div>");
        }),
        stateDerivedChild_dynamicPrimitive: withHiddenDom(async (hiddenDom) => {
            const a = van.state(1), b = van.state(2), deleted = van.state(false);
            const dom = div(() => deleted.val ? null : a.val + b.val);
            assertEq(dom.outerHTML, "<div>3</div>");
            van.add(hiddenDom, dom);
            a.val = 6;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div>8</div>");
            b.val = 5;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div>11</div>");
            deleted.val = true;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div></div>");
            // Deleted dom won't be brought back, even the underlying state is changed back
            deleted.val = false;
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<div></div>");
        }),
        stateDerivedChild_nonStateDeps: withHiddenDom(async (hiddenDom) => {
            const part1 = "👋Hello ", part2 = van.state("🗺️World");
            assertEq(van.add(hiddenDom, () => `${van.val(part1)}${van.val(part2)}, from: ${van.oldVal(part1)}${van.oldVal(part2)}`), hiddenDom);
            const dom = hiddenDom.firstChild;
            assertEq(dom.textContent, "👋Hello 🗺️World, from: 👋Hello 🗺️World");
            assertEq(hiddenDom.innerHTML, "👋Hello 🗺️World, from: 👋Hello 🗺️World");
            part2.val = "🍦VanJS";
            await sleep(waitMsOnDomUpdates);
            // dom is disconnected from the document thus it won't be updated
            assertEq(dom.textContent, "👋Hello 🗺️World, from: 👋Hello 🗺️World");
            assertEq(hiddenDom.innerHTML, "👋Hello 🍦VanJS, from: 👋Hello 🗺️World");
        }),
        stateDerivedChild_oldVal: withHiddenDom(async (hiddenDom) => {
            const text = van.state("Old Text");
            assertEq(van.add(hiddenDom, () => `From: "${van.oldVal(text)}" to: "${van.val(text)}"`), hiddenDom);
            const dom = hiddenDom.firstChild;
            assertEq(dom.textContent, 'From: "Old Text" to: "Old Text"');
            assertEq(hiddenDom.innerHTML, 'From: "Old Text" to: "Old Text"');
            text.val = "New Text";
            await sleep(waitMsOnDomUpdates);
            // dom is disconnected from the document thus it won't be updated
            assertEq(dom.textContent, 'From: "Old Text" to: "Old Text"');
            assertEq(hiddenDom.innerHTML, 'From: "Old Text" to: "New Text"');
        }),
        stateDerivedChild_errorThrown: withHiddenDom(async (hiddenDom) => {
            const num = van.state(0);
            assertEq(van.add(hiddenDom, num, () => {
                if (num.val > 0)
                    throw new Error();
                return span("ok");
            }, num), hiddenDom);
            assertEq(hiddenDom.innerHTML, "0<span>ok</span>0");
            num.val = 1;
            await sleep(waitMsOnDomUpdates);
            // The binding function 2nd child of hiddenDom throws an error.
            // We want to validate the 2nd child won't be updated because of the error,
            // but other DOM nodes are updated as usual
            assertEq(hiddenDom.innerHTML, "1<span>ok</span>1");
        }),
        hydrate_normal: withHiddenDom(async (hiddenDom) => {
            const Counter = (init) => {
                const counter = van.state(init);
                return button({ "data-counter": counter, onclick: () => ++counter.val }, () => `Count: ${counter.val}`);
            };
            // Static DOM before hydration
            hiddenDom.innerHTML = Counter(5).outerHTML;
            // Before hydration, the counter is not reactive
            hiddenDom.querySelector("button").click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, '<button data-counter="5">Count: 5</button>');
            van.hydrate(hiddenDom.querySelector("button"), dom => Counter(Number(dom.getAttribute("data-counter"))));
            // After hydration, the counter is reactive
            hiddenDom.querySelector("button").click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, '<button data-counter="6">Count: 6</button>');
        }),
        hydrate_nullToRemoveDom: withHiddenDom(async (hiddenDom) => {
            // Remove the DOM node upon hydration
            van.add(hiddenDom, div());
            van.hydrate(hiddenDom.querySelector("div"), () => null);
            assertEq(hiddenDom.innerHTML, "");
            // Remove the DOM node after the state update
            van.add(hiddenDom, div());
            const s = van.state(1);
            van.hydrate(hiddenDom.querySelector("div"), () => s.val === 1 ? pre() : null);
            assertEq(hiddenDom.innerHTML, "<pre></pre>");
            s.val = 2;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, "");
        }),
        hydrate_undefinedToRemoveDom: withHiddenDom(async (hiddenDom) => {
            // Remove the DOM node upon hydration
            van.add(hiddenDom, div());
            van.hydrate(hiddenDom.querySelector("div"), () => undefined);
            assertEq(hiddenDom.innerHTML, "");
            // Remove the DOM node after the state update
            van.add(hiddenDom, div());
            const s = van.state(1);
            van.hydrate(hiddenDom.querySelector("div"), () => s.val === 1 ? pre() : undefined);
            assertEq(hiddenDom.innerHTML, "<pre></pre>");
            s.val = 2;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, "");
        }),
        hydrate_0NotToRemoveDom: withHiddenDom(async (hiddenDom) => {
            van.add(hiddenDom, div(), div());
            const s = van.state(0);
            const [dom1, dom2] = hiddenDom.querySelectorAll("div");
            van.hydrate(dom1, (() => s.val));
            van.hydrate(dom2, (() => 1 - s.val));
            assertEq(hiddenDom.innerHTML, "01");
            s.val = 1;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, "10");
        }),
    };
    const debugTests = {
        escape_nonFuncArg: () => {
            const a = van.state(0);
            assertError("Must pass-in a function to `van._`", () => van._(++a.val));
        },
        tags_invalidProp_nonFuncOnHandler: async () => {
            const counter = van.state(0);
            assertError("Only functions and null are allowed", () => button({ onclick: ++counter.val }, "Increment"));
            assertError("Only functions and null are allowed", () => button({ onclick: 'alert("hello")' }, "Increment"));
            assertError("Only strings are allowed", () => button({ onClick: () => ++counter.val }, "Increment"));
            // State as property
            await capturingErrors("Only functions and null are allowed", 1, () => button({ onclick: van.state(++counter.val) }, "Increment"));
            // State derived property
            await capturingErrors("Only functions and null are allowed", 1, () => button({ onclick: van._(() => ++counter.val) }, "Increment"));
        },
        tags_invalidProp_nonPrimitiveValue: async () => {
            assertError(/Only.*are valid prop value types/, () => a({ href: {} }));
            assertError(/Only.*are valid prop value types/, () => a({ href: undefined }));
            // State as property
            await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: van.state({}) }));
            await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: van.state(undefined) }));
            await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: van.state(((x) => x * 2)) }));
            // State derived property
            await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: () => ({}) }));
            await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: () => undefined }));
            await capturingErrors(/Only.*are valid prop value types/, 1, () => a({ href: () => (x) => x * 2 }));
        },
        tags_invalidFollowupPropValues_stateAsProp: withHiddenDom(async (hiddenDom) => {
            const href1 = van.state("https://vanjs.org/");
            const href2 = van.state("https://vanjs.org/");
            const href3 = van.state("https://vanjs.org/");
            let numClicks = 0;
            const onclick = van.state(() => ++numClicks);
            van.add(hiddenDom, a({ href: href1 }), a({ href: href2 }), a({ href: href3 }), button({ onclick }));
            await capturingErrors(/Only.*are valid prop value types/, 3, async () => {
                href1.val = {};
                href2.val = undefined;
                href3.val = (x) => x * 2;
                await sleep(waitMsOnDomUpdates);
                assert(van.capturedErrors.length === 3 &&
                    van.capturedErrors.every(e => /Only.*are valid prop value types/.test(e)));
            });
        }),
        tags_invalidFollowupPropValues_stateDerivedProp: withHiddenDom(async (hiddenDom) => {
            const s = van.state("https://vanjs.org/"), t = van.state(() => { });
            van.add(hiddenDom, a({ href: () => s.val || {} }), a({ href: () => s.val || undefined }), a({ href: () => s.val || ((x) => x * 2) }), button({ onclick: van._(() => t.val || 1) }));
            await capturingErrors(/Only.*are valid prop value types/, 3, async () => {
                s.val = "";
                await sleep(waitMsOnDomUpdates);
            });
            await capturingErrors("Only functions and null are allowed", 1, async () => {
                t.val = 0;
                await sleep(waitMsOnDomUpdates);
            });
        }),
        tags_invalidChild: async () => {
            assertError(/Only.*are valid child of a DOM Element/, () => div(div(), {}, p()));
            await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => div(div(), van.state({}), p()));
            await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => div(div(), van.state(((x) => x * 2)), p()));
        },
        tags_alreadyConnectedChild: withHiddenDom(hiddenDom => {
            const dom = p();
            van.add(hiddenDom, dom);
            assertError("already connected to document", () => div(p(), dom, p()));
        }),
        tagsNS_invalidNs: () => {
            assertError("Must provide a string", () => van.tagsNS(1));
            assertError("Must provide a string", () => van.tagsNS(null));
            assertError("Must provide a string", () => van.tagsNS(undefined));
            assertError("Must provide a string", () => van.tagsNS({}));
            assertError("Must provide a string", () => van.tagsNS(((x) => x * 2)));
        },
        add_1stArgNotDom: () => {
            assertError("1st argument of `van.add` function must be a DOM Element object", () => van.add({}, div()));
        },
        add_invalidChild: async () => {
            const dom = div();
            assertError(/Only.*are valid child of a DOM Element/, () => van.add(dom, div(), {}, p()));
            await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => van.add(dom, div(), van.state({}), p()));
            await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => van.add(dom, div(), van.state(((x) => x * 2)), p()));
        },
        add_alreadyConnectedChild: withHiddenDom(hiddenDom => {
            const dom = div();
            van.add(hiddenDom, dom);
            assertError("already connected to document", () => van.add(hiddenDom, dom));
        }),
        state_invalidInitialVal: () => {
            assertError("couldn't have value to other state", () => van.state(van.state(0)));
            assertError("DOM Node is not valid value for state", () => van.state(div()));
        },
        state_invalidValSet: () => {
            const s = van.state(0);
            assertError("couldn't have value to other state", () => s.val = van.state(0));
            assertError("DOM Node is not valid value for state", () => s.val = div());
        },
        state_mutatingValOrOldVal: () => {
            {
                const t = van.state({ a: 2 });
                assertError("TypeError:", () => t.val.a = 3);
            }
            {
                const t = van.state({ b: 1 });
                t.val = { b: 2 };
                assertError("TypeError:", () => t.val.b = 3);
                assertError("TypeError:", () => t.oldVal.b = 3);
            }
        },
        derive_nonFuncArg: () => {
            const a = van.state(0);
            assertError("Must pass-in a function to `van.derive`", () => van.derive((a.val * 2)));
        },
        stateDerivedChild_invalidInitialResult: async () => {
            await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => div(() => ({})));
            await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => div(() => ((x) => x * 2)));
        },
        stateDerivedChild_invalidFollowupResult: withHiddenDom(async (hiddenDom) => {
            const s = van.state(1);
            van.add(hiddenDom, () => (s.val || {}), () => (s.val || ((x) => x * 2)), () => (s.val || [div(), div()]));
            await capturingErrors(/Only.*are valid child of a DOM Element/, 3, async () => {
                s.val = 0;
                await sleep(waitMsOnDomUpdates);
            });
        }),
        stateDerivedChild_derivedDom_domResultAlreadyConnected: withHiddenDom(async (hiddenDom) => {
            const dom = div();
            van.add(hiddenDom, dom);
            const num = van.state(1);
            van.add(hiddenDom, prevDom => {
                if (num.val === 1)
                    return div();
                if (num.val === 2)
                    return prevDom;
                if (num.val === 3)
                    return dom;
            });
            num.val = 2;
            await sleep(waitMsOnDomUpdates);
            // Previous dom is returned from the generation function, thus the dom tree isn't changed
            assertEq(hiddenDom.innerHTML, "<div></div><div></div>");
            await capturingErrors("it shouldn't be already connected to document", 1, async () => {
                num.val = 3;
                await sleep(waitMsOnDomUpdates);
            });
        }),
        hydrate_1stArgNotDom: () => {
            assertError("1st argument of `van.hydrate` function must be a DOM Node object", () => van.hydrate({}, () => div()));
        },
        hydrate_2ndArgNotFunc: () => {
            assertError("2nd argument of `van.hydrate` function must be a function", () => van.hydrate(div(), div()));
        },
        hydrate_invalidInitialResult: async () => {
            await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => van.hydrate(div(), () => ({})));
            await capturingErrors(/Only.*are valid child of a DOM Element/, 1, () => van.hydrate(div(), () => ((x) => x * 2)));
        },
        hydrate_invalidFollowupResult: withHiddenDom(async (hiddenDom) => {
            const cond = van.state(true);
            const dom1 = hiddenDom.appendChild(div());
            const dom2 = hiddenDom.appendChild(div());
            const dom3 = hiddenDom.appendChild(div());
            van.hydrate(dom1, () => cond.val ? div() : {});
            van.hydrate(dom2, () => cond.val ? div() : ((x) => x * 2));
            van.hydrate(dom3, () => cond.val ? div() : [div(), div()]);
            await capturingErrors(/Only.*are valid child of a DOM Element/, 3, async () => {
                cond.val = false;
                await sleep(waitMsOnDomUpdates);
            });
        }),
        hydrate_domResultAlreadyConnected: withHiddenDom(async (hiddenDom) => {
            const dom1 = hiddenDom.appendChild(div());
            const dom2 = hiddenDom.appendChild(div());
            await capturingErrors("it shouldn't be already connected to document", 1, () => van.hydrate(dom1, () => dom2));
        }),
    };
    const Counter = ({ van, id, init = 0, buttonStyle = "👍👎", }) => {
        const { button, div } = van.tags;
        const [up, down] = [...van.val(buttonStyle)];
        const counter = van.state(init);
        return div(Object.assign(Object.assign({}, (id ? { id } : {})), { "data-counter": counter }), "❤️ ", counter, " ", button({ onclick: () => ++counter.val }, up), button({ onclick: () => --counter.val }, down));
    };
    const OptimizedCounter = ({ van, id, init = 0, buttonStyle = "👍👎", }) => {
        const { button, div } = van.tags;
        const counter = van.state(init);
        return div(Object.assign(Object.assign({}, (id ? { id } : {})), { "data-counter": counter }), "❤️ ", counter, " ", button({ onclick: () => ++counter.val }, () => [...van.val(buttonStyle)][0]), button({ onclick: () => --counter.val }, () => [...van.val(buttonStyle)][1]));
    };
    const hydrateExample = (Counter) => withHiddenDom(async (hiddenDom) => {
        const counterInit = 5;
        const selectDom = select({ value: "👆👇" }, option("👆👇"), option("👍👎"), option("🔼🔽"), option("⏫⏬"), option("📈📉"));
        const buttonStyle = van.state(selectDom.value);
        selectDom.oninput = e => buttonStyle.val = e.target.value;
        // Static DOM before hydration
        hiddenDom.innerHTML = div(h2("Basic Counter"), Counter({ van, init: counterInit }), h2("Styled Counter"), p("Select the button style: ", selectDom), Counter({ van, init: counterInit, buttonStyle })).innerHTML;
        const clickBtns = async (dom, numUp, numDown) => {
            const [upBtn, downBtn] = [...dom.querySelectorAll("button")];
            for (let i = 0; i < numUp; ++i) {
                upBtn.click();
                await sleep(waitMsOnDomUpdates);
            }
            for (let i = 0; i < numDown; ++i) {
                downBtn.click();
                await sleep(waitMsOnDomUpdates);
            }
        };
        const counterHTML = (counter, buttonStyle) => {
            const [up, down] = [...buttonStyle];
            return div({ "data-counter": counter }, "❤️ ", counter, " ", button(up), button(down)).innerHTML;
        };
        // Before hydration, counters are not reactive
        let [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
        await clickBtns(basicCounter, 3, 1);
        await clickBtns(styledCounter, 2, 5);
        [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
        assertEq(basicCounter.innerHTML, counterHTML(5, "👍👎"));
        assertEq(styledCounter.innerHTML, counterHTML(5, "👆👇"));
        // Selecting a new button style won't change the actual buttons
        selectDom.value = "🔼🔽";
        selectDom.dispatchEvent(new Event("input"));
        await sleep(waitMsOnDomUpdates);
        [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
        assertEq(styledCounter.innerHTML, counterHTML(5, "👆👇"));
        selectDom.value = "👆👇";
        selectDom.dispatchEvent(new Event("input"));
        van.hydrate(basicCounter, dom => Counter({
            van,
            id: "basic-counter",
            init: Number(dom.getAttribute("data-counter")),
        }));
        van.hydrate(styledCounter, dom => Counter({
            van,
            id: "styled-counter",
            init: Number(dom.getAttribute("data-counter")),
            buttonStyle: buttonStyle,
        }));
        [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
        await clickBtns(basicCounter, 3, 1);
        await clickBtns(styledCounter, 2, 5);
        [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
        assertEq(basicCounter.innerHTML, counterHTML(7, "👍👎"));
        assertEq(styledCounter.innerHTML, counterHTML(2, "👆👇"));
        // Selecting a new button style will change the actual buttons
        const prevStyledCounter = styledCounter;
        selectDom.value = "🔼🔽";
        selectDom.dispatchEvent(new Event("input"));
        await sleep(waitMsOnDomUpdates);
        [basicCounter, styledCounter] = hiddenDom.querySelectorAll("div");
        assertEq(styledCounter.innerHTML, counterHTML(2, "🔼🔽"));
        Counter === OptimizedCounter ?
            assertEq(styledCounter, prevStyledCounter) :
            assert(styledCounter !== prevStyledCounter);
    });
    // Test cases for examples used in the documentation. Having the tests to ensure the examples
    // are always correct.
    const examples = {
        counter: withHiddenDom(async (hiddenDom) => {
            const Counter = () => {
                const counter = van.state(0);
                return div(div("❤️: ", counter), button({ onclick: () => ++counter.val }, "👍"), button({ onclick: () => --counter.val }, "👎"));
            };
            van.add(hiddenDom, Counter());
            assertEq(hiddenDom.firstChild.querySelector("div").innerText, "❤️: 0");
            const [incrementBtn, decrementBtn] = hiddenDom.getElementsByTagName("button");
            incrementBtn.click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.querySelector("div").innerText, "❤️: 1");
            incrementBtn.click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.querySelector("div").innerText, "❤️: 2");
            decrementBtn.click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.querySelector("div").innerText, "❤️: 1");
        }),
        bulletList: () => {
            const List = ({ items }) => ul(items.map((it) => li(it)));
            assertEq(List({ items: ["Item 1", "Item 2", "Item 3"] }).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
        },
        table: () => {
            const Table = ({ head, data }) => table(head ? thead(tr(head.map(h => th(h)))) : [], tbody(data.map(row => tr(row.map(col => td(col))))));
            assertEq(Table({
                head: ["ID", "Name", "Country"],
                data: [
                    [1, "John Doe", "US"],
                    [2, "Jane Smith", "CA"],
                    [3, "Bob Johnson", "AU"],
                ],
            }).outerHTML, "<table><thead><tr><th>ID</th><th>Name</th><th>Country</th></tr></thead><tbody><tr><td>1</td><td>John Doe</td><td>US</td></tr><tr><td>2</td><td>Jane Smith</td><td>CA</td></tr><tr><td>3</td><td>Bob Johnson</td><td>AU</td></tr></tbody></table>");
            assertEq(Table({
                data: [
                    [1, "John Doe", "US"],
                    [2, "Jane Smith", "CA"],
                ],
            }).outerHTML, "<table><tbody><tr><td>1</td><td>John Doe</td><td>US</td></tr><tr><td>2</td><td>Jane Smith</td><td>CA</td></tr></tbody></table>");
        },
        state: withHiddenDom(async (hiddenDom) => {
            // Create a new state object with init value 1
            const counter = van.state(1);
            // Log whenever the value of the state is updated
            van.derive(() => console.log(`Counter: ${counter.val}`));
            // Derived state
            const counterSquared = van.derive(() => counter.val * counter.val);
            // Used as a child node
            const dom1 = div(counter);
            // Used as a property
            const dom2 = input({ type: "number", value: counter, disabled: true });
            // Used in a state-derived property
            const dom3 = div({ style: () => `font-size: ${counter.val}em;` }, "Text");
            // Used in a state-derived child
            const dom4 = div(counter, sup(2), () => ` = ${counterSquared.val}`);
            // Button to increment the value of the state
            const incrementBtn = button({ onclick: () => ++counter.val }, "Increment");
            const resetBtn = button({ onclick: () => counter.val = 1 }, "Reset");
            van.add(hiddenDom, incrementBtn, resetBtn, dom1, dom2, dom3, dom4);
            assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>1</div><input type="number" disabled=""><div style="font-size: 1em;">Text</div><div>1<sup>2</sup> = 1</div>');
            assertEq(dom2.value, "1");
            incrementBtn.click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>2</div><input type="number" disabled=""><div style="font-size: 2em;">Text</div><div>2<sup>2</sup> = 4</div>');
            assertEq(dom2.value, "2");
            incrementBtn.click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>3</div><input type="number" disabled=""><div style="font-size: 3em;">Text</div><div>3<sup>2</sup> = 9</div>');
            assertEq(dom2.value, "3");
            resetBtn.click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>1</div><input type="number" disabled=""><div style="font-size: 1em;">Text</div><div>1<sup>2</sup> = 1</div>');
            assertEq(dom2.value, "1");
        }),
        derivedState: withHiddenDom(async (hiddenDom) => {
            const DerivedState = () => {
                const text = van.state("VanJS");
                const length = van.derive(() => text.val.length);
                return span("The length of ", input({ type: "text", value: text, oninput: e => text.val = e.target.value }), " is ", length, ".");
            };
            van.add(hiddenDom, DerivedState());
            const dom = (hiddenDom.firstChild);
            assertEq(dom.outerHTML, '<span>The length of <input type="text"> is 5.</span>');
            const inputDom = dom.querySelector("input");
            inputDom.value = "Mini-Van";
            inputDom.dispatchEvent(new Event("input"));
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, '<span>The length of <input type="text"> is 8.</span>');
        }),
        connectedProps: withHiddenDom(async (hiddenDom) => {
            const ConnectedProps = () => {
                const text = van.state("");
                return span(input({ type: "text", value: text, oninput: (e) => text.val = e.target.value }), input({ type: "text", value: text, oninput: (e) => text.val = e.target.value }));
            };
            van.add(hiddenDom, ConnectedProps());
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
                const size = van.state(16), color = van.state("black");
                return span("Size: ", input({ type: "range", min: 10, max: 36, value: size,
                    oninput: e => size.val = Number(e.target.value) }), " Color: ", select({ oninput: e => color.val = e.target.value, value: color }, ["black", "blue", "green", "red", "brown"].map(c => option({ value: c }, c))), span({
                    class: "preview",
                    style: () => `font-size: ${size.val}px; color: ${color.val};`,
                }, " Hello 🍦VanJS"));
            };
            van.add(hiddenDom, FontPreview());
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
        escapeDerivedProp: withHiddenDom(async (hiddenDom) => {
            const Counter = () => {
                const counter = van.state(0);
                const action = van.state("👍");
                return span("❤️ ", counter, " ", select({ oninput: e => action.val = e.target.value, value: action }, option({ value: "👍" }, "👍"), option({ value: "👎" }, "👎")), " ", button({ onclick: van._(() => action.val === "👍" ?
                        () => ++counter.val : () => --counter.val) }, "Run"));
            };
            van.add(hiddenDom, Counter());
            const dom = (hiddenDom.firstChild);
            assertEq(dom.outerHTML, '<span>❤️ 0 <select><option value="👍">👍</option><option value="👎">👎</option></select> <button>Run</button></span>');
            dom.querySelector("button").click();
            dom.querySelector("button").click();
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, '<span>❤️ 2 <select><option value="👍">👍</option><option value="👎">👎</option></select> <button>Run</button></span>');
            dom.querySelector("select").value = "👎";
            dom.querySelector("select").dispatchEvent(new Event("input"));
            await sleep(waitMsOnDomUpdates);
            dom.querySelector("button").click();
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, '<span>❤️ 1 <select><option value="👍">👍</option><option value="👎">👎</option></select> <button>Run</button></span>');
        }),
        sortedList: withHiddenDom(async (hiddenDom) => {
            const SortedList = () => {
                const items = van.state("a,b,c"), sortedBy = van.state("Ascending");
                return span("Comma-separated list: ", input({ oninput: e => items.val = e.target.value,
                    type: "text", value: items }), " ", select({ oninput: e => sortedBy.val = e.target.value, value: sortedBy }, option({ value: "Ascending" }, "Ascending"), option({ value: "Descending" }, "Descending")), 
                // A State-derived child node
                () => sortedBy.val === "Ascending" ?
                    ul(items.val.split(",").sort().map(i => li(i))) :
                    ul(items.val.split(",").sort().reverse().map(i => li(i))));
            };
            van.add(hiddenDom, SortedList());
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
                const deleted = van.state(false);
                return () => deleted.val ? null : li(text, a({ onclick: () => deleted.val = true }, "❌"));
            };
            const EditableList = () => {
                const listDom = ul();
                const textDom = input({ type: "text" });
                return div(textDom, " ", button({ onclick: () => van.add(listDom, ListItem({ text: textDom.value })) }, "➕"), listDom);
            };
            van.add(hiddenDom, EditableList());
            hiddenDom.querySelector("input").value = "abc";
            hiddenDom.querySelector("button").click();
            hiddenDom.querySelector("input").value = "123";
            hiddenDom.querySelector("button").click();
            hiddenDom.querySelector("input").value = "def";
            hiddenDom.querySelector("button").click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>abc<a>❌</a></li><li>123<a>❌</a></li><li>def<a>❌</a></li></ul>");
            {
                [...hiddenDom.querySelectorAll("li")].find(e => e.innerText.startsWith("123"))
                    .querySelector("a").click();
                await sleep(waitMsOnDomUpdates);
                assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>abc<a>❌</a></li><li>def<a>❌</a></li></ul>");
            }
            {
                [...hiddenDom.querySelectorAll("li")].find(e => e.innerText.startsWith("abc"))
                    .querySelector("a").click();
                await sleep(waitMsOnDomUpdates);
                assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul><li>def<a>❌</a></li></ul>");
            }
            {
                [...hiddenDom.querySelectorAll("li")].find(e => e.innerText.startsWith("def"))
                    .querySelector("a").click();
                await sleep(waitMsOnDomUpdates);
                assertEq(hiddenDom.querySelector("ul").outerHTML, "<ul></ul>");
            }
        }),
        polymorphicBinding: withHiddenDom(async (hiddenDom) => {
            let numYellowButtonClicked = 0;
            const Button = ({ color, text, onclick }) => button({ style: () => `background-color: ${van.val(color)};`, onclick }, text);
            const App = () => {
                const colorState = van.state("green");
                const textState = van.state("Turn Red");
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
                const onclickState = van.state(turnRed);
                return span(Button({ color: "yellow", text: "Click Me", onclick: () => ++numYellowButtonClicked }), " ", Button({ color: colorState, text: textState, onclick: onclickState }));
            };
            van.add(hiddenDom, App());
            assertEq(hiddenDom.firstChild.outerHTML, '<span><button style="background-color: yellow;">Click Me</button> <button style="background-color: green;">Turn Red</button></span>');
            const [button1, button2] = hiddenDom.querySelectorAll("button");
            button1.click();
            assertEq(numYellowButtonClicked, 1);
            button1.click();
            assertEq(numYellowButtonClicked, 2);
            button2.click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, '<span><button style="background-color: yellow;">Click Me</button> <button style="background-color: red;">Turn Green</button></span>');
            button2.click();
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.firstChild.outerHTML, '<span><button style="background-color: yellow;">Click Me</button> <button style="background-color: green;">Turn Red</button></span>');
        }),
        domValuedState_excludeDebug: withHiddenDom(async (hiddenDom) => {
            const TurnBold = () => {
                const vanJS = van.state("VanJS");
                return span(button({ onclick: () => vanJS.val = b("VanJS") }, "Turn Bold"), " Welcome to ", vanJS, ". ", vanJS, " is awesome!");
            };
            van.add(hiddenDom, TurnBold());
            const dom = (hiddenDom.firstChild);
            assertEq(dom.outerHTML, "<span><button>Turn Bold</button>&nbsp;Welcome to VanJS. VanJS&nbsp;is awesome!</span>");
            dom.querySelector("button").click();
            await sleep(waitMsOnDomUpdates);
            assertEq(dom.outerHTML, "<span><button>Turn Bold</button>&nbsp;Welcome to . <b>VanJS</b>&nbsp;is awesome!</span>");
        }),
        hydrate: hydrateExample(Counter),
        hydrateOptimized: hydrateExample(OptimizedCounter),
    };
    // In a VanJS app, there could be many derived DOM nodes, states and side effects created on-the-fly.
    // We want to test the garbage-collection process is in place to ensure obsolete bindings and
    // derivations can be cleaned up.
    const gcTests = {
        bindingBasic: withHiddenDom(async (hiddenDom) => {
            const counter = van.state(0);
            const bindingsPropKey = Object.entries(counter)
                .find(([_, v]) => Array.isArray(v))[0];
            van.add(hiddenDom, () => span(`Counter: ${counter.val}`));
            for (let i = 0; i < 100; ++i)
                ++counter.val;
            await sleep(waitMsOnDomUpdates);
            assertEq(hiddenDom.innerHTML, "<span>Counter: 100</span>");
            assertBetween(counter[bindingsPropKey].length, 1, 3);
        }),
        long_nestedBinding: withHiddenDom(async (hiddenDom) => {
            const renderPre = van.state(false);
            const text = van.state("Text");
            const bindingsPropKey = Object.entries(renderPre)
                .find(([_, v]) => Array.isArray(v))[0];
            const dom = div(() => (renderPre.val ? pre : div)(() => `--${text.val}--`));
            van.add(hiddenDom, dom);
            for (let i = 0; i < 20; ++i) {
                renderPre.val = !renderPre.val;
                await sleep(waitMsOnDomUpdates);
            }
            // Wait until GC kicks in
            await sleep(1000);
            assertBetween(renderPre[bindingsPropKey].length, 1, 3);
            assertBetween(text[bindingsPropKey].length, 1, 3);
        }),
        long_conditionalBinding: withHiddenDom(async (hiddenDom) => {
            const cond = van.state(true);
            const a = van.state(0), b = van.state(0), c = van.state(0), d = van.state(0);
            const bindingsPropKey = Object.entries(cond)
                .find(([_, v]) => Array.isArray(v))[0];
            const dom = div(() => cond.val ? a.val + b.val : c.val + d.val);
            van.add(hiddenDom, dom);
            const allStates = [cond, a, b, c, d];
            for (let i = 0; i < 100; ++i) {
                const randomState = allStates[Math.floor(Math.random() * allStates.length)];
                if (randomState === cond)
                    randomState.val = !randomState.val;
                else
                    ++randomState.val;
                await sleep(waitMsOnDomUpdates);
            }
            allStates.every(s => assertBetween(s[bindingsPropKey].length, 1, 15));
            // Wait until GC kicks in
            await sleep(1000);
            allStates.every(s => assertBetween(s[bindingsPropKey].length, 1, 3));
        }),
        deriveBasic: () => {
            const history = [];
            const a = van.state(0);
            const listenersPropKey = Object.entries(a)
                .filter(([_, v]) => Array.isArray(v))[1][0];
            van.derive(() => history.push(a.val));
            for (let i = 0; i < 100; ++i)
                ++a.val;
            assertEq(history.length, 101);
            assertBetween(a[listenersPropKey].length, 1, 3);
        },
        long_deriveInBindingFunc: withHiddenDom(async (hiddenDom) => {
            const renderPre = van.state(false);
            const prefix = van.state("Prefix");
            const bindingsPropKey = Object.entries(renderPre)
                .find(([_, v]) => Array.isArray(v))[0];
            const listenersPropKey = Object.entries(renderPre)
                .filter(([_, v]) => Array.isArray(v))[1][0];
            const dom = div(() => {
                const text = van.derive(() => `${prefix.val} - Suffix`);
                return (renderPre.val ? pre : div)(() => `--${text.val}--`);
            });
            van.add(hiddenDom, dom);
            for (let i = 0; i < 20; ++i) {
                renderPre.val = !renderPre.val;
                await sleep(waitMsOnDomUpdates);
            }
            // Wait until GC kicks in
            await sleep(1000);
            assertBetween(renderPre[bindingsPropKey].length, 1, 3);
            assertBetween(prefix[listenersPropKey].length, 1, 3);
        }),
        long_conditionalDerivedState: async () => {
            const cond = van.state(true);
            const a = van.state(0), b = van.state(0), c = van.state(0), d = van.state(0);
            const listenersPropKey = Object.entries(a)
                .filter(([_, v]) => Array.isArray(v))[1][0];
            van.derive(() => cond.val ? a.val + b.val : c.val + d.val);
            const allStates = [cond, a, b, c, d];
            for (let i = 0; i < 100; ++i) {
                const randomState = allStates[Math.floor(Math.random() * allStates.length)];
                if (randomState === cond)
                    randomState.val = !randomState.val;
                else
                    ++randomState.val;
            }
            allStates.every(s => assertBetween(s[listenersPropKey].length, 1, 10));
            // Wait until GC kicks in
            await sleep(1000);
            allStates.every(s => assertBetween(s[listenersPropKey].length, 1, 3));
        },
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
            const result = van.state("");
            const msg = van.state("");
            van.add(msgDom, div(pre(`Running ${k}.${name}...`), pre(result), pre(" "), pre(button({ onclick: async () => {
                    try {
                        await func();
                        result.val = "✅";
                        msg.val = "Rerun succeeded!";
                    }
                    catch (e) {
                        result.val = "❌";
                        msg.val = "Rerun failed!";
                        throw e;
                    }
                } }, "Rerun this test")), pre(" "), pre(msg)));
            try {
                await func();
                result.val = "✅";
            }
            catch (e) {
                result.val = "❌";
                van.add(msgDom, div({ style: "color: red" }, "Test failed, please check console for error message."));
                throw e;
            }
        }
    }
};
export const testVanFile = async (path, type) => {
    const van = await (type === "es6" ? import(path).then(r => r.default) : fetch(path).then(r => r.text()).then(t => (eval(t), window.van)));
    const { div, h2 } = van.tags;
    const msgDom = div({ class: "testMsg" });
    van.add(document.getElementById("msgPanel"), h2(`Running tests for ${path}`), msgDom);
    await runTests(van, msgDom, { debug: path.includes(".debug") });
};
