import { VanObj } from "mini-van-plate/shared"

interface Props {
  van: VanObj
}

export default ({van} : Props) => {
  const {a, div, li, p, ul} = van.tags

  const fromServer = typeof window === "undefined"
  return div(
    p(() => `👋Hello (from ${fromServer ? "server" : "client"})`),
    ul(
      li("🗺️World"),
      li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
    ),
  )
}
