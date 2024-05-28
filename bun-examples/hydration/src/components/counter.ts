import {State, getVan, vanWrapper} from "mini-van-plate/shared"

interface Props {
  id?: string
  init?: number
  buttonStyle?: string | State<string>
}

function Heart(counter: number) {
  const {span} = getVan().tags
  return span("❤️ ", counter, " ")
}

export default ({
  id, init = 0, buttonStyle = "👍👎",
}: Props) => {
  const van = getVan();
  const {button, div} = van.tags

  const stateProto = Object.getPrototypeOf(van.state())

  const val = <T>(v: T | State<T>) =>
    Object.getPrototypeOf(v ?? 0) === stateProto ? (<State<T>>v).val : <T>v

  const [up, down] = [...val(buttonStyle)]
  const counter = van.state(init)
  return div({...(id ? {id} : {}), "data-counter": counter},
    vanWrapper(() => Heart(counter.val)),
    button({onclick: () => ++counter.val}, up),
    button({onclick: () => --counter.val}, down),
  )
}
