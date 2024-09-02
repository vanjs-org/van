import van from "vanjs-core"
import * as vanGraph from "../../../src/van-graph"

const {button, div, input, option, pre, select} = van.tags

const App = () => {
  const firstName = van.state("Tao"), lastName = van.state("Xin")
  const fullName = van.derive(() => `${firstName.val} ${lastName.val}`)
  const renderPre = van.state(false)
  const rankdirDom = select({value: "TB"}, option("TB"), option("LR"))
  const graphContainerDom = div()

  const showNamed = async () => {
    const svgDom = await vanGraph.show(
      {firstName, lastName, fullName, renderPre}, {rankdir: rankdirDom.value})
    graphContainerDom.firstChild ?
      graphContainerDom.firstChild.replaceWith(svgDom) : graphContainerDom.appendChild(svgDom)
  }

  const showUnnamed = async () => {
    const svgDom = await vanGraph.show(
      [firstName, lastName, fullName, renderPre], {rankdir: rankdirDom.value})
    graphContainerDom.firstChild ?
      graphContainerDom.firstChild.replaceWith(svgDom) : graphContainerDom.appendChild(svgDom)
  }

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
    graphContainerDom,
  )
}

van.add(document.body, App())
