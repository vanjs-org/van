import type {Van, State} from "../src/van.d.ts"

(<any>window).numTests = 0

type BundleOptions = {
  readonly debug: boolean
}

type VanForTesting = Van & {
  readonly startCapturingErrors: () => void
  readonly stopCapturingErrors: () => void
  readonly capturedErrors: readonly string[]
}

const runTests = async (vanObj: VanForTesting, msgDom: Element, {debug}: BundleOptions) => {
  const {add, tags, tagsNS, state, bind} = vanObj
  const {a, button, div, input, li, option, p, pre, select, span, table, tbody, td, th, thead, tr, ul} = tags

  const assert = (cond: boolean) => {
    if (!cond) throw new Error("Assertion failed")
  }

  const assertEq = (lhs: string | number | Node, rhs: string | number | Node) => {
    if (lhs !== rhs) throw new Error(`Assertion failed. Expected equal. Actual lhs: ${lhs}, rhs: ${rhs}`)
  }

  const assertError = (msg: string | RegExp, func: () => void) => {
    let caught = false
    try {
      func()
    } catch (e) {
      if (msg instanceof RegExp) {
        if (msg.test(e.message)) caught = true; else throw e
      } else {
        if (e.message.includes(msg)) caught = true; else throw e
      }
    }
    if (!caught) throw new Error(`Expected error with message "${msg}" being thrown.`)
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  const waitMsOnDomUpdates = 5

  const withHiddenDom = (func: (dom: Element) => void | Promise<void>) => async () => {
    const dom = div({class: "hidden"})
    add(document.body, dom)
    await func(dom)
    dom.remove()
  }

  const capturingErrors = async (func: () => Promise<void>) => {
    vanObj.startCapturingErrors()
    await func()
    vanObj.stopCapturingErrors()
  }

  const tests = {
    tagsTest_basic: () => {
      const dom = div(
        p("👋Hello"),
        ul(
          li("🗺️World"),
          li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
        ),
      )

      assertEq(dom.outerHTML, '<div><p>👋Hello</p><ul><li>🗺️World</li><li><a href="https://vanjs.org/">🍦VanJS</a></li></ul></div>')
    },

    tagsTest_onclickHandler: () => {
      const dom = div(
        button({onclick: () => add(dom, p("Button clicked!"))})
      )
      dom.querySelector("button")!.click()
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>")
    },

    tagsTest_escape: () => {
      assertEq(p("<input>").outerHTML, "<p>&lt;input&gt;</p>")
      assertEq(div("a && b").outerHTML, "<div>a &amp;&amp; b</div>")
      assertEq(div("<input a && b>").outerHTML, "<div>&lt;input a &amp;&amp; b&gt;</div>")
    },

    tagsTest_nestedChildren: () => {
      assertEq(ul([li("Item 1"), li("Item 2"), li("Item 3")]).outerHTML,
        "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>")
      // Deeply nested
      assertEq(ul([[li("Item 1"), [li("Item 2")]], li("Item 3")]).outerHTML,
        "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>")
    },

    tagsTest_nullOrUndefinedAreIgnored: () => {
      assertEq(ul(li("Item 1"), li("Item 2"), undefined, li("Item 3"), null).outerHTML,
      "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>")
      assertEq(ul([li("Item 1"), li("Item 2"), undefined, li("Item 3"), null]).outerHTML,
        "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>")
      // Deeply nested
      assertEq(ul([[undefined, li("Item 1"), null, [li("Item 2")]], null, li("Item 3"), undefined]).outerHTML,
        "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>")
    },

    tagsTest_stateAsProp_connected: withHiddenDom(async hiddenDom => {
      const href = state("http://example.com/")
      const dom = a({href}, "Test Link")
      add(hiddenDom, dom)
      assertEq(dom.href, "http://example.com/")
      href.val = "https://vanjs.org/"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.href, "https://vanjs.org/")
    }),

    tagsTest_stateAsProp_disconnected: async () => {
      const href = state("http://example.com/")
      const dom = a({href}, "Test Link")
      assertEq(dom.href, "http://example.com/")
      href.val = "https://vanjs.org/"
      await sleep(waitMsOnDomUpdates)
      // href won't change as dom is not connected to document
      assertEq(dom.href, "http://example.com/")
    },

    tagsTest_stateAsOnClickHandler_connected: withHiddenDom(async hiddenDom => {
      const dom = div()
      add(hiddenDom, dom)
      const handler = state(() => add(dom, p("Button clicked!")))
      add(dom, button({onclick: handler}))
      dom.querySelector("button")!.click()
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>")

      handler.val = () => add(dom, div("Button clicked!"))
      await sleep(waitMsOnDomUpdates)
      dom.querySelector("button")!.click()
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>")
    }),

    tagsTest_stateAsOnClickHandler_disconnected: async () => {
      const dom = div()
      const handler = state(() => add(dom, p("Button clicked!")))
      add(dom, button({onclick: handler}))
      dom.querySelector("button")!.click()
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>")

      handler.val = () => add(dom, div("Button clicked!"))
      await sleep(waitMsOnDomUpdates)
      dom.querySelector("button")!.click()
      // The onclick handler won't change as dom is not connected to document, as a result, the <p> element will be added
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><p>Button clicked!</p></div>")
    },

    tagsTest_stateDerivedProp_connected: withHiddenDom(async hiddenDom => {
      const host = state("example.com")
      const path = state("/hello")
      const dom = a({href: {deps: [host, path], f: (host, path) => `https://${host}${path}`}}, "Test Link")
      add(hiddenDom, dom)
      assertEq(dom.href, "https://example.com/hello")
      host.val = "vanjs.org"
      path.val = "/start"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.href, "https://vanjs.org/start")
    }),

    tagsTest_stateDerivedProp_disconnected: async () => {
      const host = state("example.com")
      const path = state("/hello")
      const dom = a({href: {deps: [host, path], f: (host, path) => `https://${host}${path}`}}, "Test Link")
      assertEq(dom.href, "https://example.com/hello")
      host.val = "vanjs.org"
      path.val = "/start"
      await sleep(waitMsOnDomUpdates)
      // href won't change as dom is not connected to document
      assertEq(dom.href, "https://example.com/hello")
    },

    tagsTest_stateDerivedProp_nonStateDeps_connected: withHiddenDom(async hiddenDom => {
      const host = state("example.com")
      const path = "/hello"
      const dom = a({href: {deps: [host, path], f: (host, path) => `https://${host}${path}`}}, "Test Link")
      add(hiddenDom, dom)
      assertEq(dom.href, "https://example.com/hello")
      host.val = "vanjs.org"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.href, "https://vanjs.org/hello")
    }),

    tagsTest_stateDerivedProp_nonStateDeps_disconnected: async () => {
      const host = state("example.com")
      const path = "/hello"
      const dom = a({href: {deps: [host, path], f: (host, path) => `https://${host}${path}`}}, "Test Link")
      assertEq(dom.href, "https://example.com/hello")
      host.val = "vanjs.org"
      await sleep(waitMsOnDomUpdates)
      // href won't change as dom is not connected to document
      assertEq(dom.href, "https://example.com/hello")
    },

    tagsTest_stateDerivedOnClickHandler_connected: withHiddenDom(async hiddenDom => {
      const dom = div()
      add(hiddenDom, dom)
      const addPElement = state(true)
      add(dom, button({onclick: {deps: [addPElement], f: addPElement => addPElement ?
        () => add(dom, p("Button clicked!")) :
        () => add(dom, div("Button clicked!"))
      }}))
      dom.querySelector("button")!.click()
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>")

      addPElement.val = false
      await sleep(waitMsOnDomUpdates)
      dom.querySelector("button")!.click()
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><div>Button clicked!</div></div>")
    }),

    tagsTest_stateDerivedOnClickHandler_disconnected: async () => {
      const dom = div()
      const addPElement = state(true)
      add(dom, button({onclick: {deps: [addPElement], f: addPElement => addPElement ?
        () => add(dom, p("Button clicked!")) :
        () => add(dom, div("Button clicked!"))
      }}))
      dom.querySelector("button")!.click()
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p></div>")

      addPElement.val = false
      await sleep(waitMsOnDomUpdates)
      dom.querySelector("button")!.click()
      // The onclick handler won't change as dom is not connected to document, as a result, the <p> element will be added
      assertEq(dom.outerHTML, "<div><button></button><p>Button clicked!</p><p>Button clicked!</p></div>")
    },

    tagsTest_dataAttributes_connected: withHiddenDom(async hiddenDom => {
      const lineNum = state(1)
      const dom = div({
        "data-type": "line",
        "data-id": lineNum,
        "data-line": {deps: [lineNum], f: num => `line=${num}`},
      },
        "This is a test line",
      )
      add(hiddenDom, dom)
      assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>')

      lineNum.val = 3
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, '<div data-type="line" data-id="3" data-line="line=3">This is a test line</div>')
    }),

    tagsTest_dataAttributes_disconnected: async () => {
      const lineNum = state(1)
      const dom = div({
        "data-type": "line",
        "data-id": lineNum,
        "data-line": {deps: [lineNum], f: num => `line=${num}`},
      },
        "This is a test line",
      )
      assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>')

      lineNum.val = 3
      await sleep(waitMsOnDomUpdates)
      // Attributes won't change as dom is not connected to document
      assertEq(dom.outerHTML, '<div data-type="line" data-id="1" data-line="line=1">This is a test line</div>')
    },

    tagsTest_readonlyProps_connected: withHiddenDom(async hiddenDom => {
      const form = state("form1")
      const dom = button({form}, "Button")
      add(hiddenDom, dom)
      assertEq(dom.outerHTML, '<button form="form1">Button</button>')

      form.val = "form2"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, '<button form="form2">Button</button>')

      assertEq(input({list: "datalist1"}).outerHTML, '<input list="datalist1">')
    }),

    tagsTest_readonlyProps_disconnected: async () => {
      const form = state("form1")
      const dom = button({form}, "Button")
      assertEq(dom.outerHTML, '<button form="form1">Button</button>')

      form.val = "form2"
      await sleep(waitMsOnDomUpdates)
      // Attributes won't change as dom is not connected to document
      assertEq(dom.outerHTML, '<button form="form1">Button</button>')

      assertEq(input({list: "datalist1"}).outerHTML, '<input list="datalist1">')
    },

    tagsTest_stateAsChild_connected: withHiddenDom(async hiddenDom => {
      const line2 = state(<string | null>"Line 2")
      const dom = div(
        pre("Line 1"),
        pre(line2),
        pre("Line 3")
      )
      add(hiddenDom, dom)
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>")

      line2.val = "Line 2: Extra Stuff"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2: Extra Stuff</pre><pre>Line 3</pre></div>")

      // null to remove text DOM
      line2.val = null
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>")

      // Resetting the state won't bring the text DOM back
      line2.val = "Line 2"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>")
    }),

    tagsTest_stateAsChild_disconnected: async () => {
      const line2 = state(<string | null>"Line 2")
      const dom = div(
        pre("Line 1"),
        pre(line2),
        pre("Line 3")
      )
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>")

      line2.val = "Line 2: Extra Stuff"
      await sleep(waitMsOnDomUpdates)
      // Content won't change as dom is not connected to document
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>")

      line2.val = null
      await sleep(waitMsOnDomUpdates)
      // Content won't change as dom is not connected to document
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>")
    },

    tagsTest_stateAsChild_emptyStrWontDeleteDom: withHiddenDom(async hiddenDom => {
      const text = state("Text")
      const dom = p(text)
      add(hiddenDom, dom)
      assertEq(dom.outerHTML, "<p>Text</p>")
      text.val = ""
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<p></p>")
      text.val = "Text"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<p>Text</p>")
    }),

    tagsNSTest_svg: () => {
      const {circle, path, svg} = tagsNS("http://www.w3.org/2000/svg")
      const dom = svg({width: "16px", viewBox: "0 0 50 50"},
        circle({cx: "25", cy: "25", "r": "20", stroke: "black", "stroke-width": "2", fill: "yellow"}),
        circle({cx: "16", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black"}),
        circle({cx: "34", cy: "20", "r": "2", stroke: "black", "stroke-width": "2", fill: "black"}),
        path({"d": "M 15 30 Q 25 40, 35 30", stroke: "black", "stroke-width": "2", fill: "transparent"}),
      )
      assertEq(dom.outerHTML, '<svg width="16px" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" stroke="black" stroke-width="2" fill="yellow"></circle><circle cx="16" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><circle cx="34" cy="20" r="2" stroke="black" stroke-width="2" fill="black"></circle><path d="M 15 30 Q 25 40, 35 30" stroke="black" stroke-width="2" fill="transparent"></path></svg>')
    },

    tagsNSTest_math: () => {
      const {math, mi, mn, mo, mrow, msup} = tagsNS("http://www.w3.org/1998/Math/MathML")
      const dom = math(msup(mi("e"), mrow(mi("i"), mi("π"))), mo("+"), mn("1"), mo("="), mn("0"))
      assertEq(dom.outerHTML, '<math><msup><mi>e</mi><mrow><mi>i</mi><mi>π</mi></mrow></msup><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn></math>')
    },

    addTest_basic: () => {
      const dom = ul()
      assertEq(add(dom, li("Item 1"), li("Item 2")), dom)
      assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li></ul>")
      assertEq(add(dom, li("Item 3"), li("Item 4"), li("Item 5")), dom)
      assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>")
      // No-op if no children specified
      assertEq(add(dom), dom)
      assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>")
    },

    addTest_nestedChildren: () => {
      const dom = ul()
      assertEq(add(dom, [li("Item 1"), li("Item 2")]), dom)
      assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li></ul>")
      // Deeply nested
      assertEq(add(dom, [[li("Item 3"), [li("Item 4")]], li("Item 5")]), dom)
      assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>")
      // No-op if no children specified
      assertEq(add(dom, [[[]]]), dom)
      assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>")
    },

    addTest_nullOrUndefinedAreIgnored: () => {
      const dom = ul()
      assertEq(add(dom, li("Item 1"), li("Item 2"), undefined, li("Item 3"), null), dom)
      assertEq(dom.outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>")
      assertEq(add(dom, [li("Item 4"), li("Item 5"), undefined, li("Item 6"), null]), dom)
      assertEq(dom.outerHTML,
        "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>")
      // Deeply nested
      assertEq(add(dom, [[undefined, li("Item 7"), null, [li("Item 8")]], null, li("Item 9"), undefined]), dom)
      assertEq(dom.outerHTML,
        "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li><li>Item 7</li><li>Item 8</li><li>Item 9</li></ul>")
    },

    addTest_addState_connected: withHiddenDom(async hiddenDom => {
      const line2 = state(<string | null>"Line 2")
      assertEq(add(hiddenDom,
        pre("Line 1"),
        pre(line2),
        pre("Line 3")
      ), hiddenDom)
      assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>')

      line2.val = "Line 2: Extra Stuff"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre>Line 2: Extra Stuff</pre><pre>Line 3</pre></div>')

      // null to remove text DOM
      line2.val = null
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>')

      // Resetting the state won't bring the text DOM back
      line2.val = "Line 2"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.outerHTML, '<div class="hidden"><pre>Line 1</pre><pre></pre><pre>Line 3</pre></div>')
    }),

    addTest_addState_disconnected: async () => {
      const line2 = state(<string | null>"Line 2")
      const dom = div()
      assertEq(add(dom,
        pre("Line 1"),
        pre(line2),
        pre("Line 3")
      ), dom)
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>")

      line2.val = "Line 2: Extra Stuff"
      await sleep(waitMsOnDomUpdates)
      // Content won't change as dom is not connected to document
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>")

      line2.val = null
      await sleep(waitMsOnDomUpdates)
      // Content won't change as dom is not connected to document
      assertEq(dom.outerHTML, "<div><pre>Line 1</pre><pre>Line 2</pre><pre>Line 3</pre></div>")
    },

    stateTest_val: () => {
      const s = state("Init State")
      assertEq(s.val, "Init State")
      s.val = "Changed State"
      assertEq(s.val, "Changed State")
    },

    stateTest_onnew: () => {
      const history: {from: string, to: string}[] = []
      const s = state("This")
      s.onnew((v, oldV) => history.push({from: oldV, to: v}))
      s.val = "is"
      s.val = "a"
      s.val = "test"
      // Event handler won't be triggered if the new value is the same as the current one.
      s.val = "test"
      assertEq(JSON.stringify(history), '[{"from":"This","to":"is"},{"from":"is","to":"a"},{"from":"a","to":"test"}]')
    },

    stateTest_derivedStates: () => {
      const numItems = state(0)
      const items = state(<readonly string[]>[])
      numItems.onnew(v => items.val = [...Array(v).keys()].map(i => `Item ${i + 1}`))
      const selectedIndex = state(0)
      items.onnew(() => selectedIndex.val = 0)
      const selectedItem = state("")
      const setSelectedItem = () => selectedItem.val = items.val[selectedIndex.val]
      items.onnew(setSelectedItem)
      selectedIndex.onnew(setSelectedItem)

      numItems.val = 3
      assertEq(numItems.val, 3)
      assertEq(items.val.join(","), "Item 1,Item 2,Item 3")
      assertEq(selectedIndex.val, 0)
      assertEq(selectedItem.val, "Item 1")

      selectedIndex.val = 2
      assertEq(selectedIndex.val, 2)
      assertEq(selectedItem.val, "Item 3")

      numItems.val = 5
      assertEq(numItems.val, 5)
      assertEq(items.val.join(","), "Item 1,Item 2,Item 3,Item 4,Item 5")
      assertEq(selectedIndex.val, 0)
      assertEq(selectedItem.val, "Item 1")

      selectedIndex.val = 3
      assertEq(selectedIndex.val, 3)
      assertEq(selectedItem.val, "Item 4")
    },

    bindTest_dynamicDom: withHiddenDom(async hiddenDom => {
      const verticalPlacement = state(false)
      const button1Text = state("Button 1"), button2Text = state("Button 2"), button3Text = state("Button 3")

      const dom = <Element>bind(verticalPlacement, v =>
        v ? div(
          div(button(button1Text)),
          div(button(button2Text)),
          div(button(button3Text)),
        ) : div(
          button(button1Text), button(button2Text), button(button3Text),
        )
      )
      assertEq(add(hiddenDom, dom), hiddenDom)

      assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2</button><button>Button 3</button></div>")
      button2Text.val = "Button 2: Extra"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>")

      verticalPlacement.val = true
      await sleep(waitMsOnDomUpdates)

      // dom is disconnected from the document thus it won't be updated
      assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>")
      assertEq((<Element>hiddenDom.firstChild).outerHTML, "<div><div><button>Button 1</button></div><div><button>Button 2: Extra</button></div><div><button>Button 3</button></div></div>")
      button2Text.val = "Button 2: Extra Extra"
      await sleep(waitMsOnDomUpdates)
      // Since dom is disconnected from document, its inner button won't be reactive to state changes
      assertEq(dom.outerHTML, "<div><button>Button 1</button><button>Button 2: Extra</button><button>Button 3</button></div>")
      assertEq((<Element>hiddenDom.firstChild).outerHTML, "<div><div><button>Button 1</button></div><div><button>Button 2: Extra Extra</button></div><div><button>Button 3</button></div></div>")
    }),

    bindTest_statefulDynamicDom: withHiddenDom(async hiddenDom => {
      const numItems = state(0)
      const items = state(<readonly string[]>[])
      numItems.onnew(v => items.val = [...Array(v).keys()].map(i => `Item ${i + 1}`))
      const selectedIndex = state(0)
      items.onnew(() => selectedIndex.val = 0)

      const dom = bind(items, selectedIndex, (items, selectedIndex, dom, oldItems, oldSelectedIndex) => {
        // If items aren't changed, we don't need to regenerate the entire dom
        if (dom && items === oldItems) {
          const itemDoms = dom.childNodes;
          (<Element>itemDoms[oldSelectedIndex]).classList.remove("selected");
          (<Element>itemDoms[selectedIndex]).classList.add("selected")
          return dom
        }

        return ul(
          items.map((item, i) => li({class: i === selectedIndex ? "selected" : ""}, item))
        )
      })
      add(hiddenDom, dom)

      numItems.val = 3
      await sleep(waitMsOnDomUpdates)
      assertEq((<Element>hiddenDom.firstChild).outerHTML, '<ul><li class="selected">Item 1</li><li class="">Item 2</li><li class="">Item 3</li></ul>')
      const rootDom1stIteration = <Element>hiddenDom.firstChild

      selectedIndex.val = 1
      await sleep(waitMsOnDomUpdates)
      assertEq((<Element>hiddenDom.firstChild).outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>')
      // Items aren't changed, thus we don't need to regenerate the dom
      assertEq(hiddenDom.firstChild!, rootDom1stIteration)

      numItems.val = 5
      await sleep(waitMsOnDomUpdates)
      // Items are changed, thus the dom for the list is regenerated
      assertEq((<Element>hiddenDom.firstChild).outerHTML, '<ul><li class="selected">Item 1</li><li class="">Item 2</li><li class="">Item 3</li><li class="">Item 4</li><li class="">Item 5</li></ul>')
      assert(hiddenDom.firstChild !== rootDom1stIteration)
      // rootDom1stIteration is disconnected from the document and remain unchanged
      assertEq(rootDom1stIteration.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>')
      const rootDom2ndIteration = hiddenDom.firstChild!

      selectedIndex.val = 2
      await sleep(waitMsOnDomUpdates)
      assertEq((<Element>hiddenDom.firstChild).outerHTML, '<ul><li class="">Item 1</li><li class="">Item 2</li><li class="selected">Item 3</li><li class="">Item 4</li><li class="">Item 5</li></ul>')
      // Items aren't changed, thus we don't need to regenerate the dom
      assertEq(hiddenDom.firstChild!, rootDom2ndIteration)
      // rootDom1stIteration won't be updated as it has already been disconnected from the document
      assertEq(rootDom1stIteration.outerHTML, '<ul><li class="">Item 1</li><li class="selected">Item 2</li><li class="">Item 3</li></ul>')
    }),

    bindTest_nullToRemoveDom: withHiddenDom(async hiddenDom => {
      const line1 = state("Line 1"), line2 = state("Line 2"), line3 = state(<string | null>"Line 3")

      const dom = div(
        bind(line1, l => l === "" ? null : p(l)),
        bind(line2, l => l === "" ? null : p(l)),
        p(line3),
      )
      add(hiddenDom, dom)

      assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p></div>")
      // Delete Line 2
      line2.val = ""
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p></div>")

      // Deleted dom won't be brought back, even the underlying state is changed back
      line2.val = "Line 2"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p></div>")

      // Delete Line 3
      line3.val = null
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p></div>")

      // Deleted dom won't be brought back, even the underlying state is changed back
      line3.val = "Line 3"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p></div>")
    }),

    bindTest_undefinedToRemoveDom: withHiddenDom(async hiddenDom => {
      const line1 = state("Line 1"), line2 = state("Line 2"), line3 = state(<string | undefined>"Line 3")

      const dom = div(
        bind(line1, l => l === "" ? undefined : p(l)),
        bind(line2, l => l === "" ? undefined : p(l)),
        p(line3),
      )
      add(hiddenDom, dom)

      assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 2</p><p>Line 3</p></div>")
      // Delete Line 2
      line2.val = ""
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p></div>")

      // Deleted dom won't be brought back, even the underlying state is changed back
      line2.val = "Line 2"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><p>Line 1</p><p>Line 3</p></div>")

      // Delete Line 3
      line3.val = undefined
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p></div>")

      // Deleted dom won't be brought back, even the underlying state is changed back
      line3.val = "Line 3"
      await sleep(waitMsOnDomUpdates)
      assertEq(dom.outerHTML, "<div><p>Line 1</p><p></p></div>")
    }),

    bindTest_nonStateDeps: withHiddenDom(async hiddenDom => {
      const part1 = "👋Hello ", part2 = state("🗺️World")

      const dom = <Text>bind(part1, part2, (part1, part2) => part1 + part2)
      assertEq(add(hiddenDom, dom), hiddenDom)

      assertEq(dom.textContent!, "👋Hello 🗺️World")
      assertEq(hiddenDom.innerHTML, "👋Hello 🗺️World")

      part2.val = "🍦VanJS"
      await sleep(waitMsOnDomUpdates)

      // dom is disconnected from the document thus it won't be updated
      assertEq(dom.textContent!, "👋Hello 🗺️World")
      assertEq(hiddenDom.innerHTML, "👋Hello 🍦VanJS")
    }),
  }

  const debugTests = {
    tagsTest_invalidProp_nonFuncOnHandler: () => {
      const counter = state(0)
      assertError("Only functions are allowed",
        () => button({onclick: ++counter.val}, "Increment"))
    },

    tagsTest_invalidProp_nonPrimitiveValue: () => {
      assertError(/Only.*are valid prop value types/, () => a({href: null}))
      assertError(/Only.*are valid prop value types/, () => a(<any>{href: undefined}))
      assertError(/Only.*are valid prop value types/, () => a(<any>{href: (x: number) => x * 2}))

      // State as property
      assertError(/Only.*are valid prop value types/, () => a({href: state(<any>{})}))
      assertError(/Only.*are valid prop value types/, () => a({href: state(null)}))
      assertError(/Only.*are valid prop value types/, () => a({href: state(<any>undefined)}))
      assertError(/Only.*are valid prop value types/, () => a({href: state((x: number) => x * 2)}))

      // State derived property
      const s = state(0)
      assertError(/Only.*are valid prop value types/, () => a({href: {deps: [s], f: <any>(() => {})}}))
      assertError(/Only.*are valid prop value types/, () => a({href: {deps: [s], f: () => null}}))
      assertError(/Only.*are valid prop value types/, () => a({href: {deps: [s], f: <any>(() => undefined)}}))
      assertError(/Only.*are valid prop value types/, () => a({href: {deps: [s], f: () => (x: number) => x * 2}}))
    },

    tagsTest_invalidChild: () => {
      assertError(/Only.*are valid child of a DOM Node/, () => div(div(), <any>{}, p()))
      assertError(/Only.*are valid child of a DOM Node/, () => div(div(), <any>((x: number) => x * 2), p()))

      assertError(/Only.*are valid child of a DOM Node/, () => div(div(), state(<any>{}), p()))
      assertError(/Only.*are valid child of a DOM Node/, () => div(div(), state(<any>((x: number) => x * 2)), p()))
    },

    tagsTest_alreadyConnectedChild: withHiddenDom(hiddenDom => {
      const dom = p()
      add(hiddenDom, dom)
      assertError("already connected to document", () => div(p(), dom, p()))
    }),

    tagsNSTest_invalidNs: () => {
      assertError("Must provide a string", () => tagsNS(<any>1))
      assertError("Must provide a string", () => tagsNS(<any>null))
      assertError("Must provide a string", () => tagsNS(<any>undefined))
      assertError("Must provide a string", () => tagsNS(<any>{}))
      assertError("Must provide a string", () => tagsNS(<any>((x: number) => x * 2)))
    },

    addTest_1stArgNotDom: () => {
      assertError("1st argument of `add` function must be a DOM Node object",
        () => add(<any>{}, div()))
    },

    addTest_invalidChild: () => {
      const dom = div()

      assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div(), <any>{}, p()))
      assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div(), <any>((x: number) => x * 2), p()))

      assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div(), state(<any>{}), p()))
      assertError(/Only.*are valid child of a DOM Node/, () => add(dom, div(), state(<any>((x: number) => x * 2)), p()))
    },

    addTest_alreadyConnectedChild: withHiddenDom(hiddenDom => {
      const dom = div()
      add(hiddenDom, dom)
      assertError("already connected to document", () => add(hiddenDom, dom))
    }),

    stateTest_invalidInitialVal: () => {
      assertError("DOM Node is not valid", () => state(document))
      assertError("couldn't have value to other state", () => state(state(0)))
    },

    stateTest_invalidValSet: () => {
      const s = state(<number | Node | State<number>>0)
      assertError("DOM Node is not valid", () => s.val = document)
      assertError("couldn't have value to other state", () => s.val = state(0))
    },

    stateTest_nonFunctionOnnewListener: () => {
      const s = state(0)
      let t = 0
      assertError("You should pass-in functions to register `onnew` handlers", () => s.onnew(<any>++t))
    },

    stateTest_mutatingVal: () => {
      {
        const t = state({a: 2})
        assertError("Cannot assign to read only property 'a'", () => t.val.a = 3)
      }
      {
        const t = state({b: 1})
        t.val = {b: 2}
        assertError("Cannot assign to read only property 'b'", () => t.val.b = 3)
      }
    },

    bindTest_noStates: () => {
      // @ts-ignore
      assertError("1 or more states", () => bind())
      // @ts-ignore
      assertError("1 or more states", () => bind(x => x * 2))
    },

    bindTest_lastArgNotFunc: () =>
      assertError("must be the generation function", () => bind(state(0), <any>state(1))),

    bindTest_invalidInitialResult: () => {
      const s = state(0)
      assertError("must be DOM node, primitive, null or undefined", () => bind(s, <any>(() => ({}))))
      assertError("must be DOM node, primitive, null or undefined", () => bind(s, <any>(() => x => x * 2)))
    },

    bindTest_invalidFollowupResult: withHiddenDom(async hiddenDom => {
      const s = state(1)
      add(hiddenDom,
        bind(s, <any>(s => s || {})),
        bind(s, <any>(s => s || (x => x * 2)))
      )
      await capturingErrors(async () => {
        s.val = 0
        await sleep(waitMsOnDomUpdates)
        assert(vanObj.capturedErrors.length === 2 &&
          vanObj.capturedErrors.every(e => e.includes("must be DOM node, primitive, null or undefined")))
      })
    }),

    bindTest_derivedDom_domResultAlreadyConnected: withHiddenDom(async hiddenDom => {
      const dom = div()
      add(hiddenDom, dom)
      const num = state(1)
      add(hiddenDom, bind(num, (num, prevDom) => {
        if (num === 1) return div()
        if (num === 2) return prevDom
        if (num === 3) return dom
      }))
      num.val = 2
      await sleep(waitMsOnDomUpdates)
      // Previous dom is returned from the generation function, thus the dom tree isn't changed
      assertEq(hiddenDom.innerHTML, "<div></div><div></div>")

      await capturingErrors(async () => {
        num.val = 3
        await sleep(waitMsOnDomUpdates)
        assert(vanObj.capturedErrors[0].includes("it shouldn't be already connected to document"))
      })
    }),
  }

  // Test cases for examples used in the documentation. Having the tests to ensure the examples
  // are always correct.
  const examples = {
    counter: withHiddenDom(async hiddenDom => {
      const Counter = () => {
        const counter = state(0)
        return div(
          div("❤️: ", counter),
          button({onclick: () => ++counter.val}, "👍"),
          button({onclick: () => --counter.val}, "👎"),
        )
      }

      add(hiddenDom, Counter())

      assertEq((<Element>hiddenDom.firstChild).querySelector("div")!.innerText, "❤️: 0")

      const [incrementBtn, decrementBtn] = hiddenDom.getElementsByTagName("button")

      incrementBtn.click()
      await sleep(waitMsOnDomUpdates)
      assertEq((<Element>hiddenDom.firstChild).querySelector("div")!.innerText, "❤️: 1")

      incrementBtn.click()
      await sleep(waitMsOnDomUpdates)
      assertEq((<Element>hiddenDom.firstChild).querySelector("div")!.innerText, "❤️: 2")

      decrementBtn.click()
      await sleep(waitMsOnDomUpdates)
      assertEq((<Element>hiddenDom.firstChild).querySelector("div")!.innerText, "❤️: 1")
    }),

    bulletList: () => {
      const List = ({items}) => ul(items.map((it: any) => li(it)))
      assertEq(List({items: ["Item 1", "Item 2", "Item 3"]}).outerHTML, "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>")
    },

    table: () => {
      const Table = ({head, data}:
        {head?: readonly string[], data: readonly (string | number)[][]}) => table(
        head ? thead(tr(head.map(h => th(h)))) : [],
        tbody(data.map(row => tr(
          row.map(col => td(col))
        ))),
      )

      assertEq(Table({
        head: ["ID", "Name", "Country"],
        data: [
          [1, "John Doe", "US"],
          [2, "Jane Smith", "CA"],
          [3, "Bob Johnson", "AU"],
        ],
      }).outerHTML, "<table><thead><tr><th>ID</th><th>Name</th><th>Country</th></tr></thead><tbody><tr><td>1</td><td>John Doe</td><td>US</td></tr><tr><td>2</td><td>Jane Smith</td><td>CA</td></tr><tr><td>3</td><td>Bob Johnson</td><td>AU</td></tr></tbody></table>")

      assertEq(Table({
        data: [
          [1, "John Doe", "US"],
          [2, "Jane Smith", "CA"],
        ],
      }).outerHTML, "<table><tbody><tr><td>1</td><td>John Doe</td><td>US</td></tr><tr><td>2</td><td>Jane Smith</td><td>CA</td></tr></tbody></table>")
    },

    stateExample: withHiddenDom(async hiddenDom => {
      // Create a new State object with init value 1
      const counter = state(1)

      // Log whenever the value of the state is updated
      counter.onnew((v, oldV) => console.log(`Counter: ${oldV} -> ${v}`))

      // Used as a child node
      const dom1 = div(counter)

      // Used as a property
      const dom2 = input({type: "number", value: counter, disabled: true})

      // Used in a state-derived property
      const dom3 = div(
        {style: {deps: [counter], f: c => `font-size: ${c}em;`}},
        "Text")

      // Used in a complex binding
      const dom4 = div(bind(counter, c => `${c}^2 = ${c * c}`))

      // Button to increment the value of the state
      const incrementBtn = button({onclick: () => ++counter.val}, "Increment")
      const resetBtn = button({onclick: () => counter.val = 1}, "Reset")

      add(hiddenDom, incrementBtn, resetBtn, dom1, dom2, dom3, dom4)

      assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>1</div><input type="number" disabled=""><div style="font-size: 1em;">Text</div><div>1^2 = 1</div>')
      assertEq(dom2.value, "1")

      incrementBtn.click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>2</div><input type="number" disabled=""><div style="font-size: 2em;">Text</div><div>2^2 = 4</div>')
      assertEq(dom2.value, "2")

      incrementBtn.click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>3</div><input type="number" disabled=""><div style="font-size: 3em;">Text</div><div>3^2 = 9</div>')
      assertEq(dom2.value, "3")

      resetBtn.click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<button>Increment</button><button>Reset</button><div>1</div><input type="number" disabled=""><div style="font-size: 1em;">Text</div><div>1^2 = 1</div>')
      assertEq(dom2.value, "1")
    }),

    connectedProps: withHiddenDom(async hiddenDom => {
      const ConnectedProps = () => {
        const value = state("")
        return span(
          input({type: "text", value, oninput: e => value.val = e.target.value}),
          input({type: "text", value, oninput: e => value.val = e.target.value}),
        )
      }
      add(hiddenDom, ConnectedProps())

      const [input1, input2] = hiddenDom.querySelectorAll("input")
      input1.value += "123"
      input1.dispatchEvent(new Event("input"))
      await sleep(waitMsOnDomUpdates)
      assertEq(input1.value, "123")
      assertEq(input2.value, "123")

      input2.value += "abc"
      input2.dispatchEvent(new Event("input"))
      await sleep(waitMsOnDomUpdates)
      assertEq(input1.value, "123abc")
      assertEq(input2.value, "123abc")
    }),

    fontPreview: withHiddenDom(async hiddenDom => {
      const FontPreview = () => {
        const size = state(16), color = state("black")
        return span(
          "Size: ",
          input({type: "range", min: 10, max: 36, value: size,
            oninput: e => size.val = e.target.value}),
          " Color: ",
          select({oninput: e => color.val = e.target.value, value: color},
            ["black", "blue", "green", "red", "brown"].map(c => option({value: c}, c)),
          ),
          span(
          {
            class: "preview",
            style: {deps: [size, color], f: (size, color) =>
              `font-size: ${size}px; color: ${color};`},
          }, " Hello 🍦VanJS"),
        )
      }
      add(hiddenDom, FontPreview())
      assertEq((<any>hiddenDom.querySelector("span.preview")).style.cssText,
        "font-size: 16px; color: black;")

      hiddenDom.querySelector("input")!.value = "20"
      hiddenDom.querySelector("input")!.dispatchEvent(new Event("input"))
      await sleep(waitMsOnDomUpdates)
      assertEq((<any>hiddenDom.querySelector("span.preview")).style.cssText,
        "font-size: 20px; color: black;")

      hiddenDom.querySelector("select")!.value = "blue"
      hiddenDom.querySelector("select")!.dispatchEvent(new Event("input"))
      await sleep(waitMsOnDomUpdates)
      assertEq((<any>hiddenDom.querySelector("span.preview")).style.cssText,
        "font-size: 20px; color: blue;")
    }),

    sortedList: withHiddenDom(async hiddenDom => {
      const SortedList = () => {
        const items = state("a,b,c"), sortedBy = state("Ascending")
        return span(
          "Comma-separated list: ",
          input({oninput: e => items.val = e.target.value,
            type: "text", value: items}), " ",
          select({oninput: e => sortedBy.val = e.target.value, value: sortedBy},
            option({value: "Ascending"}, "Ascending"),
            option({value: "Descending"}, "Descending"),
          ),
          bind(items, sortedBy, (items, sortedBy) =>
            sortedBy === "Ascending" ?
              ul(items.split(",").sort().map(i => li(i))) :
              ul(items.split(",").sort().reverse().map(i => li(i)))),
        )
      }
      add(hiddenDom, SortedList())

      hiddenDom.querySelector("input")!.value = "a,b,c,d"
      hiddenDom.querySelector("input")!.dispatchEvent(new Event("input"))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.querySelector("ul")!.outerHTML,
        "<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>")

      hiddenDom.querySelector("select")!.value = "Descending"
      hiddenDom.querySelector("select")!.dispatchEvent(new Event("input"))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.querySelector("ul")!.outerHTML,
        "<ul><li>d</li><li>c</li><li>b</li><li>a</li></ul>")
    }),

    editableList: withHiddenDom(async hiddenDom => {
      const ListItem = ({text}) => {
        const deleted = state(false)
        return bind(deleted, d => d ? null : li(
          text,
          a({onclick: () => deleted.val = true}, "❌"),
        ))
      }

      const EditableList = () => {
        const listDom = ul()
        const textDom = input({type: "text"})
        return div(
          textDom, " ", button({
            onclick: () => add(listDom, ListItem({text: textDom.value})),
          }, "➕"),
          listDom,
        )
      }
      add(hiddenDom, EditableList())

      hiddenDom.querySelector("input")!.value = "abc"
      hiddenDom.querySelector("button")!.click()
      hiddenDom.querySelector("input")!.value = "123"
      hiddenDom.querySelector("button")!.click()
      hiddenDom.querySelector("input")!.value = "def"
      hiddenDom.querySelector("button")!.click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.querySelector("ul")!.outerHTML,
        "<ul><li>abc<a>❌</a></li><li>123<a>❌</a></li><li>def<a>❌</a></li></ul>")

      {
        [...hiddenDom.querySelectorAll("li")].find(e => e.innerText.startsWith("123"))!
          .querySelector("a")!.click()
          await sleep(waitMsOnDomUpdates)
          assertEq(hiddenDom.querySelector("ul")!.outerHTML,
            "<ul><li>abc<a>❌</a></li><li>def<a>❌</a></li></ul>")
      }
      {
        [...hiddenDom.querySelectorAll("li")].find(e => e.innerText.startsWith("abc"))!
          .querySelector("a")!.click()
          await sleep(waitMsOnDomUpdates)
          assertEq(hiddenDom.querySelector("ul")!.outerHTML,
            "<ul><li>def<a>❌</a></li></ul>")
      }
      {
        [...hiddenDom.querySelectorAll("li")].find(e => e.innerText.startsWith("def"))!
          .querySelector("a")!.click()
          await sleep(waitMsOnDomUpdates)
          assertEq(hiddenDom.querySelector("ul")!.outerHTML, "<ul></ul>")
      }
    }),
  }

  // In a VanJS app, there could be many derived DOM nodes created on-the-fly. We want to test the
  // garbage-collection process is in place to ensure obsolete bindings can be cleaned up.
  const gcTests = {
    derivedDom: withHiddenDom(async hiddenDom => {
      const renderPre = state(false)
      const text = state("Text")
      const TextLine = (renderPre: boolean) =>
        (renderPre ? pre : div)(
          bind(text, t => `--${t}--`),
        )
      const dom = div(bind(renderPre, TextLine))
      add(hiddenDom, dom)

      for (let i = 0; i < 20; ++i) {
        renderPre.val = !renderPre.val
        await sleep(waitMsOnDomUpdates)
      }

      // Wait until GC kicks in
      await sleep(1000)
      // Find the `bindings` property in `text`. The name can be arbitrary due to property mangling
      // in minized scripts.
      const bindings = Object.values(text).find(v => Array.isArray(v) && v.length > 0)
      assert((<any>bindings).length < 10)
    })
  }

  type Suite = { [name: string]: () => void | Promise<void> }
  const suites: { [k: string]: Suite} = {tests, examples, gcTests}
  if (debug) suites.debugTests = debugTests

  for (const [k, v] of Object.entries(suites)) {
    for (const [name, func] of Object.entries(v)) {
      ++(<any>window).numTests
      const result = state("")
      const msg = state("")
      add(msgDom, div(
        pre(`Running ${k}.${name}...`),
        pre(result),
        pre(" "),
        pre(button({onclick: async () => {
          try {
            await func()
            result.val = "✅"
            msg.val = "Rerun succeeded!"
          } catch (e) {
            result.val = "❌"
            msg.val = "Rerun failed!"
            throw e
          }
        }}, "Rerun this test")),
        pre(" "),
        pre(msg),
      ))

      try {
        await func()
        result.val = "✅"
      } catch (e) {
        result.val = "❌"
        add(msgDom, div({style: "color: red"},
          "Test failed, please check console for error message."
        ))
        throw e
      }
    }
  }
}

export const testVanFile = async (path: string, type: string) => {
  const van = await (type === "es6" ? import(path).then(r => r.default) : fetch(path).then(r => r.text()).then(t => (eval(t), (<any>window).van)))
  const {div, h2} = van.tags
  const msgDom = div({class: "testMsg"})
  van.add(document.getElementById("msgPanel"), h2(`Running tests for ${path}`), msgDom)
  await runTests(van, msgDom, {debug: path.includes(".debug")})
}
