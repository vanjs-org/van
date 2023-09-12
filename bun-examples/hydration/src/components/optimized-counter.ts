import { VanObj, State } from "mini-van-plate/shared"

interface Props {
  van: VanObj
  id?: string
  init?: number
  buttonStyle?: string | State<string>
}

export default ({
  van, id, init = 0, buttonStyle = "👍👎",
}: Props) => {
  const {button, div} = van.tags

  const counter = van.state(init)
  return div({...(id ? {id} : {}), "data-counter": counter},
    "❤️ ", counter, " ",
    button({onclick: () => ++counter.val}, () => [...van.val(buttonStyle)][0]),
    button({onclick: () => --counter.val}, () => [...van.val(buttonStyle)][1]),
  )
}
