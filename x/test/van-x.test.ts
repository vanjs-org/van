import type { Van } from "../../src/van.d.ts"
import * as vanXObj from "../src/van-x"

declare global {
  interface Window { numTests: number, runTests: Function }
}

window.numTests = 0

window.runTests = async (van: Van, vanX: typeof vanXObj, file: string) => {
  const {a, button, code, div, h2, li, pre, span, sup, ul} = van.tags

  const assertEq = (lhs: string | number | Node | undefined, rhs: string | number | Node | undefined) => {
    if (lhs !== rhs) throw new Error(`Assertion failed. Expected equal. Actual lhs: ${lhs}, rhs: ${rhs}.`)
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  const waitMsOnDomUpdates = 5

  const withHiddenDom = (func: (dom: Element) => void | Promise<void>) => async () => {
    const dom = div({class: "hidden"})
    van.add(document.body, dom)
    try {
      await func(dom)
    } finally {
      dom.remove()
    }
  }

  const tests = {
    reactive_basic: withHiddenDom(async hiddenDom => {
      const base = vanX.reactive({
        a: 1,
        b: 2,
        name: {
          first: "Tao",
          last: "Xin",
        },
        list: [1, 2, 3],
      })
      const derived = vanX.reactive({
        // Derived individual fields
        a: {
          double: vanX.calc(() => base.a * 2),
          squared: vanX.calc(() => base.a * base.a),
        },
        // Derived object
        b: vanX.calc(() => ({
          double: base.b * 2,
          squared: base.b * base.b,
        })),
        fullName: vanX.calc(() => `${base.name.first} ${base.name.last}`),
        list: vanX.calc(() => ({
          length: base.list.length,
          sum: base.list.reduce((acc, val) => acc + val, 0),
        })),
      })

      assertEq(Object.keys(base).toString(), "a,b,name,list")
      assertEq(Object.keys(derived).toString(), "a,b,fullName,list")

      van.add(hiddenDom, div(
        div(code(() => `${base.a} * 2 = ${derived.a.double}`)),
        div(code(() => base.a, sup(2), " = ", () => derived.a.squared)),
        div(code(() => `${base.b} * 2 = ${derived.b.double}`)),
        div(code(() => base.b, sup(2), " = ", () => derived.b.squared)),
        div("Name: ", () => `${base.name.first} ${base.name.last}`),
        // Directly using the state object
        div("Full name: ", vanX.stateFields(derived).fullName),
        div("The length of ", () => base.list.toString(), " is ", () => derived.list.length, "."),
        div("The sum of ", () => base.list.toString(), " is ", () => derived.list.sum, "."),
      ))

      assertEq(hiddenDom.innerHTML, '<div><div><code>1 * 2 = 2</code></div><div><code>1<sup>2</sup> = 1</code></div><div><code>2 * 2 = 4</code></div><div><code>2<sup>2</sup> = 4</code></div><div>Name: Tao Xin</div><div>Full name: Tao Xin</div><div>The length of 1,2,3 is 3.</div><div>The sum of 1,2,3 is 6.</div></div>')

      base.a = 5
      base.b = 10
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Tao Xin</div><div>Full name: Tao Xin</div><div>The length of 1,2,3 is 3.</div><div>The sum of 1,2,3 is 6.</div></div>')

      base.name = {first: "Vanilla", last: "JavaScript"}
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Vanilla JavaScript</div><div>Full name: Vanilla JavaScript</div><div>The length of 1,2,3 is 3.</div><div>The sum of 1,2,3 is 6.</div></div>')

      base.name.first = "Van"
      base.name.last = "JS"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Van JS</div><div>Full name: Van JS</div><div>The length of 1,2,3 is 3.</div><div>The sum of 1,2,3 is 6.</div></div>')

      base.list = [1, 2, 3, 4, 5]
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Van JS</div><div>Full name: Van JS</div><div>The length of 1,2,3,4,5 is 5.</div><div>The sum of 1,2,3,4,5 is 15.</div></div>')

      base.list[2] = 5
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Van JS</div><div>Full name: Van JS</div><div>The length of 1,2,5,4,5 is 5.</div><div>The sum of 1,2,5,4,5 is 17.</div></div>')

      // Validate we can alter the values deeply under `derived` object
      derived.b.double = 21
      derived.b.squared = 101
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 21</code></div><div><code>10<sup>2</sup> = 101</code></div><div>Name: Van JS</div><div>Full name: Van JS</div><div>The length of 1,2,5,4,5 is 5.</div><div>The sum of 1,2,5,4,5 is 17.</div></div>')
    }),

    reactive_insertNewField: withHiddenDom(async hiddenDom => {
      interface ObjWithName {
        name: {first: string, last: string}
      }
      const base = vanX.reactive(<ObjWithName>{})
      assertEq(Object.keys(base).toString(), "")
      base.name = {first: "Tao", last: "Xin"}
      assertEq(Object.keys(base).toString(), "name")
      assertEq(Object.keys(base.name).toString(), "first,last")
      interface ObjWithFullName { fullName: string }
      const derived = vanX.reactive(<ObjWithFullName>{})
      assertEq(Object.keys(derived).toString(), "")
      derived.fullName = vanX.calc(() => `${base.name.first} ${base.name.last}`)
      assertEq(Object.keys(derived).toString(), "fullName")

      van.add(hiddenDom,
        div("Name: ", () => `${base.name.first} ${base.name.last}`),
        // Directly using the state object
        div("Full name: ", vanX.stateFields(derived).fullName),
      )

      assertEq(hiddenDom.innerHTML, '<div>Name: Tao Xin</div><div>Full name: Tao Xin</div>')

      base.name.first = "Alexander"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div>Name: Alexander Xin</div><div>Full name: Alexander Xin</div>')

      base.name = {first: "Vanilla", last: "JavaScript"}
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div>Name: Vanilla JavaScript</div><div>Full name: Vanilla JavaScript</div>')

      base.name.first = "Van"
      base.name.last = "JS"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div>Name: Van JS</div><div>Full name: Van JS</div>')
    }),

    reactive_existingClassWithMethod: withHiddenDom(async hiddenDom => {
      class Person {
        constructor(public firstName: string, public lastName: string) {}
        fullName() { return `${this.firstName} ${this.lastName}` }
      }

      const person = vanX.reactive(new Person("Tao", "Xin"))

      van.add(hiddenDom,
        div("Name: ", () => `${person.firstName} ${person.lastName}`),
        div("Full name: ", () => person.fullName()),
      )

      assertEq(hiddenDom.innerHTML, '<div>Name: Tao Xin</div><div>Full name: Tao Xin</div>')

      person.firstName = "Vanilla"
      person.lastName = "JavaScript"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div>Name: Vanilla JavaScript</div><div>Full name: Vanilla JavaScript</div>')

      person.firstName = "Van"
      person.lastName = "JS"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div>Name: Van JS</div><div>Full name: Van JS</div>')
    }),

    reactive_existingClassWithCustomGet: withHiddenDom(async hiddenDom => {
      class Person {
        constructor(public firstName: string, public lastName: string) {}
        get fullName() { return `${this.firstName} ${this.lastName}` }
      }

      const person = vanX.reactive(new Person("Tao", "Xin"))

      van.add(hiddenDom,
        div("Name: ", () => `${person.firstName} ${person.lastName}`),
        div("Full name: ", () => person.fullName),
      )

      assertEq(hiddenDom.innerHTML, '<div>Name: Tao Xin</div><div>Full name: Tao Xin</div>')

      person.firstName = "Vanilla"
      person.lastName = "JavaScript"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div>Name: Vanilla JavaScript</div><div>Full name: Vanilla JavaScript</div>')

      person.firstName = "Van"
      person.lastName = "JS"
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div>Name: Van JS</div><div>Full name: Van JS</div>')
    }),

    reactive_deleteProperty: () => {
      interface Data { a?: number, b?: number }
      const data = vanX.reactive(<Data>{a: 1, b: 2})
      delete data.a
      assertEq(JSON.stringify(data), '{"b":2}')
      assertEq(Object.keys(vanX.stateFields(data)).toString(), "b")
      delete data.b
      assertEq(JSON.stringify(data), '{}')
      assertEq(Object.keys(vanX.stateFields(data)).toString(), "")
    },

    list_arraySetItem: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive([1, 2, 3])
      van.add(hiddenDom, vanX.list(ul, items, v => li(v)))

      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>')

      items[1] = 5
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li><li>3</li></ul>')

      items[2] = 6
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li><li>6</li></ul>')
    }),

    list_objSetItem: withHiddenDom(async hiddenDom => {
      {
        const items = vanX.reactive({a: 1, b: 2, c: 3})
        van.add(hiddenDom, vanX.list(ul, items, v => li(v)))

        assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>')

        items.b = 5
        await sleep(waitMsOnDomUpdates)
        assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li><li>3</li></ul>')

        items.c = 6
        await sleep(waitMsOnDomUpdates)
        assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li><li>6</li></ul>')
      }
    }),

    list_arrayAdd: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive([1, 2, 3])
      van.add(hiddenDom, vanX.list(ul, items, v => li(v)))

      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>')

      items.push(4)
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>')

      items.push(5)
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>')
    }),

    list_objAdd: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive(<Record<string, number>>{a: 1, b: 2, c: 3})
      van.add(hiddenDom, vanX.list(ul, items, v => li(v)))

      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>')

      items.d = 4
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>')

      items.e = 5
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>')
    }),

    list_arrayDelete: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive(["a", "b", "c"])
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: deleter}, "❌"))))

      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>b<button>❌</button></li><li>c<button>❌</button></li></ul>')

      const deleteBtns = hiddenDom.querySelectorAll("button")
      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>c<button>❌</button></li></ul>')
      assertEq(Object.keys(items).toString(), "0,2")

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>c<button>❌</button></li></ul>')
      assertEq(Object.keys(items).toString(), "2")

      deleteBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    list_objDelete: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive({a: "a", b: "b", c: "c"})
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: deleter}, "❌"))))

      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>b<button>❌</button></li><li>c<button>❌</button></li></ul>')

      const deleteBtns = hiddenDom.querySelectorAll("button")
      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>c<button>❌</button></li></ul>')
      assertEq(Object.keys(items).toString(), "a,c")

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>c<button>❌</button></li></ul>')
      assertEq(Object.keys(items).toString(), "c")

      deleteBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    list_array_multipleBindings: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive([1, 2, 3])
      van.add(hiddenDom,
        vanX.list(div, items, v => div(v, button({onclick: () => ++v.val}, "👍"))),
        vanX.list(ul, items, (v, deleter) => li(v, button({onclick: deleter}, "❌"))),
      )

      assertEq(hiddenDom.innerHTML, '<div><div>1<button>👍</button></div><div>2<button>👍</button></div><div>3<button>👍</button></div></div><ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>')

      const incBtns = hiddenDom.querySelectorAll("div button")
      const deleteBtns = hiddenDom.querySelectorAll("ul button")

      ;(<HTMLButtonElement>incBtns[0]).click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div>2<button>👍</button></div><div>2<button>👍</button></div><div>3<button>👍</button></div></div><ul><li>2<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>')

      ;(<HTMLButtonElement>deleteBtns[1]).click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div>2<button>👍</button></div><div>3<button>👍</button></div></div><ul><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>')
      assertEq(Object.keys(items).toString(), "0,2")
    }),

    list_obj_multipleBindings: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive({a: 1, b: 2, c: 3})
      van.add(hiddenDom,
        vanX.list(div, items, v => div(v, button({onclick: () => ++v.val}, "👍"))),
        vanX.list(ul, items, (v, deleter) => li(v, button({onclick: deleter}, "❌"))),
      )

      assertEq(hiddenDom.innerHTML, '<div><div>1<button>👍</button></div><div>2<button>👍</button></div><div>3<button>👍</button></div></div><ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>')

      const incBtns = hiddenDom.querySelectorAll("div button")
      const deleteBtns = hiddenDom.querySelectorAll("ul button")

      ;(<HTMLButtonElement>incBtns[2]).click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div>1<button>👍</button></div><div>2<button>👍</button></div><div>4<button>👍</button></div></div><ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>4<button>❌</button></li></ul>')

      ;(<HTMLButtonElement>deleteBtns[1]).click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<div><div>1<button>👍</button></div><div>4<button>👍</button></div></div><ul><li>1<button>❌</button></li><li>4<button>❌</button></li></ul>')
      assertEq(Object.keys(items).toString(), "a,c")
    }),

    replace_filterArray: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive([1, 2, 3])
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: () => ++v.val}, "👍"), a({onclick: deleter}, "❌"))
      ))

      assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>')

      let incBtns = hiddenDom.querySelectorAll("button")
      incBtns[0].click()
      incBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>')

      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>')

      vanX.replace(items, l => l.filter(v => v % 2 === 0))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0,1")

      // Validate increment and delete buttons still work in the new DOM tree
      incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")
      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>5<button>👍</button><a>❌</a></li></ul>')

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>5<button>👍</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "1")

      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    replace_filterObj: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive({a: 1, b: 2, c: 3})
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: () => ++v.val}, "👍"), a({onclick: deleter}, "❌"))
      ))

      assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>')

      let incBtns = hiddenDom.querySelectorAll("button")
      incBtns[0].click()
      incBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>')

      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>')

      vanX.replace(items, l => l.filter(([_, v]) => v % 2 === 0))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a,c")

      // Validate increment and delete buttons still work in the new DOM tree
      incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")
      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>5<button>👍</button><a>❌</a></li></ul>')

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>5<button>👍</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "c")

      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    replace_updateArray: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive([1, 2, 3])
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: () => ++v.val}, "👍"), a({onclick: deleter}, "❌"))
      ))

      assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>')

      let incBtns = hiddenDom.querySelectorAll("button")
      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>')

      vanX.replace(items, l => l.map(v => v * 2))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li></ul>')

      // Validate increment and delete buttons still work in the new DOM tree
      incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")

      incBtns[0].click()
      incBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li><li>7<button>👍</button><a>❌</a></li></ul>')

      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li><li>7<button>👍</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0,2")

      deleteBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0")

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    replace_updateObj: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive({a: 1, b: 2, c: 3})
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: () => ++v.val}, "👍"), a({onclick: deleter}, "❌"))
      ))

      assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>')

      let incBtns = hiddenDom.querySelectorAll("button")
      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>')

      vanX.replace(items, l => l.map(([k, v]) => [k, v * 2]))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li></ul>')

      // Validate increment and delete buttons still work in the new DOM tree
      incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")

      incBtns[0].click()
      incBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li><li>7<button>👍</button><a>❌</a></li></ul>')

      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li><li>7<button>👍</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a,c")

      deleteBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a")

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    replace_doubleArray: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive(["a", "b"])
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: () => v.val += "!" }, "❗"), a({onclick: deleter}, "❌"))
      ))

      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b<button>❗</button><a>❌</a></li></ul>')

      let incBtns = hiddenDom.querySelectorAll("button")
      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>')

      vanX.replace(items, l => l.flatMap(v => [v, v + "-2"]))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>a-2<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li><li>b!-2<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0,1,2,3")

      // Validate increment and delete buttons still work in the new DOM tree
      incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")

      incBtns[1].click()
      incBtns[3].click()
      incBtns[2].click()
      incBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>a-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>')

      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0,2,3")

      deleteBtns[3].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0,2")

      deleteBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0")

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    replace_doubleObj: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive({a: "a", b: "b"})
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: () => v.val += "!" }, "❗"), a({onclick: deleter}, "❌"))
      ))

      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b<button>❗</button><a>❌</a></li></ul>')

      let incBtns = hiddenDom.querySelectorAll("button")
      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>')

      vanX.replace(items, l => l.flatMap(
        ([k, v]) => [[k, v], [k + "-2", v + "-2"]]
      ))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>a-2<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li><li>b!-2<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a,a-2,b,b-2")

      // Validate increment and delete buttons still work in the new DOM tree
      incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")

      incBtns[1].click()
      incBtns[3].click()
      incBtns[2].click()
      incBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>a-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>')

      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a,b,b-2")

      deleteBtns[3].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a,b")

      deleteBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a")

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    replace_doubleArray_prepend: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive(["a", "b"])
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: () => v.val += "!" }, "❗"), a({onclick: deleter}, "❌"))
      ))

      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b<button>❗</button><a>❌</a></li></ul>')

      let incBtns = hiddenDom.querySelectorAll("button")
      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>')

      vanX.replace(items, l => l.flatMap(v => [v + "-2", v]))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2<button>❗</button><a>❌</a></li><li>a<button>❗</button><a>❌</a></li><li>b!-2<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>')

      // Validate increment and delete buttons still work in the new DOM tree
      incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")

      incBtns[1].click()
      incBtns[3].click()
      incBtns[2].click()
      incBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>a!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>')

      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0,2,3")

      deleteBtns[3].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0,2")

      deleteBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "0")

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    replace_doubleObj_prepend: withHiddenDom(async hiddenDom => {
      const items = vanX.reactive({a: "a", b: "b"})
      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(v, button({onclick: () => v.val += "!" }, "❗"), a({onclick: deleter}, "❌"))
      ))

      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b<button>❗</button><a>❌</a></li></ul>')

      let incBtns = hiddenDom.querySelectorAll("button")
      incBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>')

      vanX.replace(items, l => l.flatMap(([k, v]) => [[k + "-2", v + "-2"], [k, v]]))
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2<button>❗</button><a>❌</a></li><li>a<button>❗</button><a>❌</a></li><li>b!-2<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>')

      // Validate increment and delete buttons still work in the new DOM tree
      incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")

      incBtns[1].click()
      incBtns[3].click()
      incBtns[2].click()
      incBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>a!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>')

      deleteBtns[1].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a-2,b-2,b")

      deleteBtns[3].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a-2,b-2")

      deleteBtns[2].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li></ul>')
      assertEq(Object.keys(items).toString(), "a-2")

      deleteBtns[0].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(hiddenDom.innerHTML, '<ul></ul>')
      assertEq(Object.keys(items).toString(), "")
    }),

    replace_sortArray: withHiddenDom(async hiddenDom => {
      const arr = Array.from({length: 10}).map((_, i) => i)
      const shuffled = arr.toSorted(() => Math.random() - 0.5)
      const items = vanX.reactive([10, ...shuffled].map(v => v.toString()))

      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(span(v), button({onclick: () => v.val += "!" }, "❗"), a({onclick: deleter}, "❌"))
      ))

      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        [10, ...shuffled].toString(),
      )

      hiddenDom.querySelector("a")!.click()
      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        [...shuffled].toString(),
      )

      vanX.replace(items, l => l.toSorted())
      await sleep(waitMsOnDomUpdates)
      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        arr.toString(),
      )

      // Validate increment and delete buttons still work in the new DOM tree
      const incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")

      incBtns[2].click()
      incBtns[5].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        "0,1,2!,3,4,5!,6,7,8,9",
      )

      deleteBtns[6].click()
      deleteBtns[8].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        "0,1,2!,3,4,5!,7,9",
      )
    }),

    replace_sortObj: withHiddenDom(async hiddenDom => {
      const arr = Array.from({length: 10}).map((_, i) => i)
      const shuffled = arr.toSorted(() => Math.random() - 0.5)
      const items = vanX.reactive(<Record<string, string>>Object.fromEntries(
        [["k", "10"], ...shuffled.map(v => ["k" + v, v.toString()])]
      ))

      van.add(hiddenDom, vanX.list(ul, items,
        (v, deleter) => li(span(v), button({onclick: () => v.val += "!" }, "❗"), a({onclick: deleter}, "❌"))
      ))

      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        [10, shuffled].toString(),
      )

      hiddenDom.querySelector("a")!.click()
      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        [...shuffled].toString(),
      )

      vanX.replace(items, kvs => kvs.toSorted(([_1, v1], [_2, v2]) => v1.localeCompare(v2)))
      await sleep(waitMsOnDomUpdates)
      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        arr.toString(),
      )

      // Validate increment and delete buttons still work in the new DOM tree
      const incBtns = hiddenDom.querySelectorAll("button")
      const deleteBtns = hiddenDom.querySelectorAll("a")

      incBtns[2].click()
      incBtns[5].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        "0,1,2!,3,4,5!,6,7,8,9",
      )

      deleteBtns[6].click()
      deleteBtns[8].click()
      await sleep(waitMsOnDomUpdates)
      assertEq(
        [...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(),
        "0,1,2!,3,4,5!,7,9",
      )
    }),
  }

  type Suite = Record<string, () => void | Promise<void>>
  const suites: Record<string, Suite> = {tests}

  const msgDom = van.add(document.getElementById("msgPanel")!, h2("Running tests for ", file))
    .appendChild(div({class: "testMsg"}))

  for (const [k, v] of Object.entries(suites)) {
    for (const [name, func] of Object.entries(v)) {
      ++window.numTests
      const result = van.state(""), msg = van.state("")
      van.add(msgDom, div(
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
        van.add(msgDom, div({style: "color: red"},
          "Test failed, please check console for error message."
        ))
        throw e
      }
    }
  }
}
