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
  readonly [key: string]: ChildDom | ChildDom[]
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
  const tabButtonRowStyles = {
    overflow: "hidden",
    "background-color": tabButtonRowColor,
    ...tabButtonRowStyleOverrides,
  }
  const tabButtonStyles = {
    float: "left",
    border: "none",
    "border-right": tabButtonBorderStyle,
    outline: "none",
    cursor: "pointer",
    padding: "8px 16px",
    transition: "0.3s",
    ...tabButtonStyleOverrides,
  }
  const tabButtonStylesStr = toStyleStr(tabButtonStyles)
  const tabContentStyles = {
    padding: "6px 12px",
    "border-top": "none",
    ...tabContentStyleOverrides,
  }
  const tabContentStylesStr = toStyleStr(tabContentStyles)

  const id = "vanui-tabs-" + (++tabsId)
  van.add(document.head,
    van.tags["style"](`#${id} .vanui-tab-button { background-color: inherit }
#${id} .vanui-tab-button:hover { background-color: ${tabButtonHoverColor} }
#${id} .vanui-tab-button.active { background-color: ${tabButtonActiveColor} }`))
  return div({id, class: resultClass, style},
    div({class: tabButtonRowClass, style: toStyleStr(tabButtonRowStyles)},
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
  const toggleStyles = {
    position: "relative",
    display: "inline-block",
    width: "1.76rem",
    height: "1rem",
    ...(size === 1 ? {} : {zoom: size}),
    cursor,
    ...toggleStyleOverrides,
  }
  const inputStyles = {
    opacity: 0,
    width: 0,
    height: 0,
    position: "absolute",
    "z-index": 10000,  // Ensures the toggle clickable
  }
  const sliderStyles = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: ".4s",
    "border-radius": "1rem",
    ...sliderStyleOverrides,
  }
  const sliderStylesStr = toStyleStr(sliderStyles)
  const circleStyles = {
    position: "absolute",
    height: "0.76rem",
    width: "0.76rem",
    left: "0.12rem",
    bottom: "0.12rem",
    "background-color": circleColor,
    transition: ".4s",
    "border-radius": "50%",
    ...circleStyleOverrides,
  }
  const circleStylesStr = toStyleStr(circleStyles)
  const circleStylesWhenOn = {
    transform: "translateX(0.76rem)",
    ...circleWhenOnStyleOverrides,
  }
  const circleStylesWhenOnStr = toStyleStr(circleStylesWhenOn)
  return label({class: toggleClass, style: toStyleStr(toggleStyles)},
    input({type: "checkbox", style: toStyleStr(inputStyles),
      oninput: e => onState.val = e.target.checked}),
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
