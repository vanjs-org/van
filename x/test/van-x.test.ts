import type { Van } from "../../src/van.d.ts"
import * as vanXObj from "../src/van-x"

declare global {
  interface Window { numTests: number }
}

window.numTests = 0

const runTests = async (van: Van, vanX: typeof vanXObj, file: string) => {
  const {button, code, div, h2, p, pre, sup} = van.tags

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
    reactive: withHiddenDom(async hiddenDom => {
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
          double: () => base.a * 2,
          squared: () => base.a * base.a,
        },
        // Derived object
        b: () => ({
          double: base.b * 2,
          squared: base.b * base.b,
        }),
        fullName: () => `${base.name.first} ${base.name.last}`,
        length: () => base.list.length,
      })

      van.add(hiddenDom, div(
        p(code(() => `${base.a} * 2 = ${derived.a.double}`)),
        p(code(() => base.a, sup(2), " = ", () => derived.a.squared)),
        p(code(() => `${base.b} * 2 = ${derived.b.double}`)),
        p(code(() => base.b, sup(2), " = ", () => derived.b.squared)),
        p("Name: ", () => `${base.name.first} ${base.name.last}`),
        // Directly using the state object
        p("Full name: ", derived[vanX.statesSym].fullName),
        p("The length of ", () => base.list.toString(), " is ", () => derived.length, "."),
      ))

      assertEq(hiddenDom.innerHTML, '')
    })
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
