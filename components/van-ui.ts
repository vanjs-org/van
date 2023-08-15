import van, { ChildDom, State } from "vanjs-core"

// Quote all tag names so that they're not mangled by minifier
const {"button": button, "div": div, "input": input, "label": label, "span": span} = van.tags

export interface CSSPropertyBag {
  readonly [key: string]: string | number
}

const toStyleStr = (style: CSSPropertyBag) =>
  Object.entries(style).map(([k, v]) => `${k}: ${v};`).join("")

export interface ModalProps {
  readonly closed: State<boolean>
  readonly backgroundColor?: string
  readonly blurBackground?: boolean

  readonly backgroundClass?: string
  readonly backgroundStyleOverrides?: CSSPropertyBag
  readonly modalClass?: string
  readonly modalStyleOverrides?: CSSPropertyBag
}

export const Modal = (
  {
    closed,
    backgroundColor = "rgba(0,0,0,.5)",
    blurBackground = false,
    backgroundClass = "",
    backgroundStyleOverrides = {},
    modalClass = "",
    modalStyleOverrides = {},
  }: ModalProps,
  ...children: readonly ChildDom[]
) => {
  const backgroundStyle = {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: "fixed",
    "z-index": 10000,
    "background-color": backgroundColor,
    "backdrop-filter": blurBackground ? "blur(0.25rem)" : "none",
    ...backgroundStyleOverrides,
  }
  const modalStyle = {
    "border-radius": "0.5rem",
    padding: "1rem",
    display: "block",
    "background-color": "white",
    ...modalStyleOverrides,
  }

  return () => closed.val ? null : div(
    {class: backgroundClass, style: toStyleStr(backgroundStyle)},
    div({class: modalClass, style: toStyleStr(modalStyle)}, children),
  )
}

export interface TabsProps {
  readonly activeTab?: State<string> | undefined
  readonly resultClass?: string
  readonly style?: string
  readonly tabButtonRowColor?: string
  readonly tabButtonBorderStyle?: string
  readonly tabButtonHoverColor?: string
  readonly tabButtonActiveColor?: string

  readonly tabButtonRowClass?: string
  readonly tabButtonRowStyleOverrides?: CSSPropertyBag
  readonly tabButtonClass?: string
  readonly tabButtonStyleOverrides?: CSSPropertyBag
  readonly tabContentClass?: string
  readonly tabContentStyleOverrides?: CSSPropertyBag
}

export interface TabsContent {
  readonly [key: string]: ChildDom | readonly ChildDom[]
}

let tabsId = 0

export const Tabs = (
  {
    activeTab,
    resultClass = "",
    style = "",
    tabButtonRowColor = "#f1f1f1",
    tabButtonBorderStyle = "1px solid #000",
    tabButtonHoverColor = "#ddd",
    tabButtonActiveColor = "#ccc",
    tabButtonRowClass = "",
    tabButtonRowStyleOverrides = {},
    tabButtonClass = "",
    tabButtonStyleOverrides = {},
    tabContentClass = "",
    tabContentStyleOverrides = {},
  }: TabsProps,
  contents: TabsContent,
) => {
  const activeTabState = activeTab ?? van.state(Object.keys(contents)[0])
  const tabButtonRowStylesStr = toStyleStr({
    overflow: "hidden",
    "background-color": tabButtonRowColor,
    ...tabButtonRowStyleOverrides,
  })
  const tabButtonStylesStr = toStyleStr({
    float: "left",
    border: "none",
    "border-right": tabButtonBorderStyle,
    outline: "none",
    cursor: "pointer",
    padding: "8px 16px",
    transition: "0.3s",
    ...tabButtonStyleOverrides,
  })
  const tabContentStylesStr = toStyleStr({
    padding: "6px 12px",
    "border-top": "none",
    ...tabContentStyleOverrides,
  })

  const id = "vanui-tabs-" + (++tabsId)
  van.add(document.head,
    van.tags["style"](`#${id} .vanui-tab-button { background-color: inherit }
#${id} .vanui-tab-button:hover { background-color: ${tabButtonHoverColor} }
#${id} .vanui-tab-button.active { background-color: ${tabButtonActiveColor} }`))
  return div({id, class: resultClass, style},
    div({class: tabButtonRowClass, style: tabButtonRowStylesStr},
      Object.keys(contents).map(k =>
        button({
          class: () => {
            const classes = ["vanui-tab-button"]
            if (tabButtonClass) classes.push(tabButtonClass)
            if (k === activeTabState.val) classes.push("active")
            return classes.join(" ")
          },
          style: tabButtonStylesStr,
          onclick: () => activeTabState.val = k,
        }, k)
      ),
    ),
    Object.entries(contents).map(([k, v]) => div(
      {
        class: tabContentClass,
        style: () => `display: ${k === activeTabState.val ? "block" : "none"}; ${tabContentStylesStr}`,
      },
      v,
    ))
  )
}

export interface ToggleProps {
  readonly on?: boolean | State<boolean>
  readonly size?: number
  readonly cursor?: string
  readonly offColor?: string
  readonly onColor?: string
  readonly circleColor?: string

  readonly toggleClass?: string
  readonly toggleStyleOverrides?: CSSPropertyBag
  readonly sliderClass?: string
  readonly sliderStyleOverrides?: CSSPropertyBag
  readonly circleClass?: string
  readonly circleStyleOverrides?: CSSPropertyBag
  readonly circleWhenOnStyleOverrides?: CSSPropertyBag
}

export const Toggle = ({
  on = false,
  size = 1,
  cursor = "pointer",
  offColor = "#ccc",
  onColor = "#2196F3",
  circleColor = "white",
  toggleClass = "",
  toggleStyleOverrides = {},
  sliderClass = "",
  sliderStyleOverrides = {},
  circleClass = "",
  circleStyleOverrides = {},
  circleWhenOnStyleOverrides = {},
}: ToggleProps) => {
  const onState = typeof on === "boolean" ? van.state(on) : on
  const toggleStylesStr = toStyleStr({
    position: "relative",
    display: "inline-block",
    width: 1.76 * size + "rem",
    height: size + "rem",
    cursor,
    ...toggleStyleOverrides,
  })
  const inputStylesStr = toStyleStr({
    opacity: 0,
    width: 0,
    height: 0,
    position: "absolute",
    "z-index": 10000,  // Ensures the toggle clickable
  })
  const sliderStylesStr = toStyleStr({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: ".4s",
    "border-radius": size + "rem",
    ...sliderStyleOverrides,
  })
  const circleStylesStr = toStyleStr({
    position: "absolute",
    height: 0.76 * size + "rem",
    width: 0.76 * size + "rem",
    left: 0.12 * size + "rem",
    bottom: 0.12 * size + "rem",
    "background-color": circleColor,
    transition: ".4s",
    "border-radius": "50%",
    ...circleStyleOverrides,
  })
  const circleStylesWhenOnStr = toStyleStr({
    transform: `translateX(${0.76 * size}rem)`,
    ...circleWhenOnStyleOverrides,
  })
  return label({class: toggleClass, style: toggleStylesStr},
    input({type: "checkbox", style: inputStylesStr, oninput: e => onState.val = e.target.checked}),
    span(
      {
        class: sliderClass,
        style: () => `${sliderStylesStr}; background-color: ${onState.val ? onColor : offColor};`,
      },
      span({
        class: circleClass,
        style: () => circleStylesStr + (onState.val ? circleStylesWhenOnStr : ""),
      }),
    ),
  )
}

export interface MessageBoardProps {
  readonly top?: string
  readonly bottom?: string
  readonly backgroundColor?: string
  readonly fontColor?: string
  readonly fadeOutSec?: number

  readonly boardClass?: string
  readonly boardStyleOverrides?: CSSPropertyBag
  readonly messageClass?: string
  readonly messageStyleOverrides?: CSSPropertyBag
  readonly closerClass?: string
  readonly closerStyleOverrides?: CSSPropertyBag
}

export interface MessageProps {
  readonly message: ChildDom | readonly ChildDom[]
  readonly closer?: ChildDom | readonly ChildDom[]
  readonly durationSec?: number
  readonly closed?: State<boolean>
}

export class MessageBoard {
  private _fadeOutSec: number
  private _messageClass: string
  private _messageStylesStr: string
  private _closerClass: string
  private _closerStylesStr: string
  private _dom: HTMLElement

  constructor({
    top = "unset",
    bottom = "unset",
    backgroundColor = "#333D",
    fontColor = "white",
    fadeOutSec = 0.3,
    boardClass = "",
    boardStyleOverrides = {},
    messageClass = "",
    messageStyleOverrides = {},
    closerClass = "",
    closerStyleOverrides = {},
  }: MessageBoardProps, parentDom = document.body) {
    const boardStylesStr = toStyleStr({
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
      position: "fixed",
      top,
      bottom,
      left: "50%",
      transform: "translateX(-50%)",
      "z-index": 10000,
      ...boardStyleOverrides,
    })
    this._fadeOutSec = fadeOutSec
    this._messageClass = messageClass
    this._messageStylesStr = toStyleStr({
      display: "flex",
      "background-color": backgroundColor,
      color: fontColor,
      padding: "15px",
      "margin-bottom": "10px",
      "border-radius": "5px",
      transition: `opacity ${fadeOutSec}s, transform ${fadeOutSec}s`,
      ...messageStyleOverrides,
    })
    this._closerClass = closerClass
    this._closerStylesStr = toStyleStr({
      display: "flex",
      "align-items": "center",
      "margin-left": "10px",
      cursor: "pointer",
      ...closerStyleOverrides
    })

    parentDom.appendChild(this._dom = div({class: boardClass, style: boardStylesStr}))
  }

  show({
    message,
    closer,
    durationSec,
    closed = van.state(false),
  }: MessageProps) {
    const removed = van.state(false)
    van.derive(() => setTimeout((v: boolean) => removed.val = v, this._fadeOutSec * 1000, closed.val))
    const msgDom = div({class: this._messageClass, style: this._messageStylesStr},
      div(message),
      closer ? span(
        {class: this._closerClass, style: this._closerStylesStr, onclick: () => closed.val = true},
        closer,
      ) : null,
    )
    van.derive(() =>
      closed.val && (msgDom.style.opacity = "0", msgDom.style.transform = "translateY(-20px)"))
    if (durationSec) setTimeout(() => closed.val = true, durationSec * 1000)
    van.add(this._dom, () => removed.val ? null : msgDom)
  }

  remove() { this._dom.remove() }
}
