import van from "vanjs-core"
import * as vanGraph from "vanjs-graph"

const {button, div, input, option, pre, select} = van.tags
const {svg} = van.tags("http://www.w3.org/2000/svg")

const App = () => {
  const firstName = van.state("Tao"), lastName = van.state("Xin")
  const fullName = van.derive(() => `${firstName.val} ${lastName.val}`)
  const renderPre = van.state(false)
  const rankdirDom = select({value: "LR"}, option("LR"), option("TB"), option("RL"), option("BT"))
  let svgDom = svg()

  const showNamed = async () => svgDom.replaceWith(svgDom = await vanGraph.show(
    {firstName, lastName, fullName, renderPre}, {rankdir: rankdirDom.value}))

  const showUnnamed = async () => svgDom.replaceWith(svgDom = await vanGraph.show(
    [firstName, lastName, fullName, renderPre], {rankdir: rankdirDom.value}))

  return div(
    div(
      "firstName: ",
      input({type: "text", value: firstName, oninput: e => firstName.val = e.target.value}),
      " lastName: ",
      input({type: "text", value: lastName, oninput: e => lastName.val = e.target.value}),
      " renderPre: ",
      input({type: "checkbox", value: renderPre, onclick: e => renderPre.val = e.target.checked}),
    ),
    () => (renderPre.val ? pre : div)(
      div("My first name is: ", firstName),
      div("My last name is: ", lastName),
      div("My full name is: ", fullName),
    ),
    div(
      button({onclick: showNamed}, "Show state graph (named)"), " ",
      button({onclick: showUnnamed}, "Show state graph (unnamed)"),
      " rankdir: ", rankdirDom,
    ),
    div(svgDom),
  )
}

van.add(document.body, App())
