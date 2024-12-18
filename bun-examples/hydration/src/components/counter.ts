import { env, State } from "mini-van-plate/shared"

interface Props {
  readonly id?: string
  readonly init?: number
  readonly buttonStyle?: string | State<string>
}

export default ({id, init = 0, buttonStyle = "👍👎"}: Props) => {
  const {button, div} = env.van.tags

  const stateProto = Object.getPrototypeOf(env.van.state())

  const val = <T>(v: T | State<T>) =>
    Object.getPrototypeOf(v ?? 0) === stateProto ? (<State<T>>v).val : <T>v

  const [up, down] = [...val(buttonStyle)]
  const counter = env.van.state(init)
  return div({...(id ? {id} : {}), "data-counter": counter},
    "❤️ ", counter, " ",
    button({onclick: () => ++counter.val}, up),
    button({onclick: () => --counter.val}, down),
  )
}
