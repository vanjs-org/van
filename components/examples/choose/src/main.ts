import van from "vanjs-core"
// import { choose } from "vanjs-ui"
import { choose } from "../../../dist/van-ui"

const {b, button, code, div, h1, p} = van.tags

const example1 = async () => {
  const selected = await choose({
    label: "Choose a color:",
    options: ["Red", "Green", "Blue"],
  })
  selected && van.add(document.body, div("You chose: ", b(selected)))
}

const example2 = async () => {
  const selected = await choose({
    label: "Choose a South American country:",
    options: [
      "🇦🇷 Argentina", "🇧🇴 Bolivia", "🇧🇷 Brazil", "🇨🇱 Chile", "🇨🇴 Colombia", "🇪🇨 Ecuador",
      "🇬🇾 Guyana", "🇵🇾 Paraguay", "🇵🇪 Peru", "🇸🇷 Suriname", "🇺🇾 Uruguay", "🇻🇪 Venezuela",
    ],
    customModalProps: {
      blurBackground: true,
      modalStyleOverrides: {height: "300px"},
    },
    selectedColor: "blue",
    selectedStyleOverrides: {color: "white"},
  })
  selected && van.add(document.body, div("You chose: ", b(selected)))
}

const ModalDemo = () => {
  return div(
    h1("Choose Demo"),
    p("This is a demo for the ", code("choose"), " function in ", b("VanUI"), "."),
    p(button({onclick: example1}, "Example 1"), " ", button({onclick: example2}, "Example 2")),
  )
}

van.add(document.body, ModalDemo())
