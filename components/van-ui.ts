import van, { ChildDom, State } from "vanjs-core"

// Quote all tag names so that they're not mangled by minifier
const {"button": button, "div": div} = van.tags

const toStyleStr = (style: object) =>
  Object.entries(style).map(([k, v]) => `${k}: ${v};`).join("")

export interface ModalProps {
  readonly closed: State<boolean>
  readonly backgroundColor?: string
  readonly blurBackground?: boolean

  readonly backgroundClass?: string
  readonly backgroundStyleOverrides?: object
  readonly modalClass?: string
  readonly modalStyleOverrides?: object
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
    ...backgroundStyleOverrides
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
  readonly tabButtonRowStyleOverrides?: object
  readonly tabButtonClass?: string
  readonly tabButtonStyleOverrides?: object
  readonly tabContentClass?: string
  readonly tabContentStyleOverrides?: object
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
    div({style: toStyleStr(tabButtonRowStyles), class: tabButtonRowClass},
      Object.keys(contents).map(k =>
        button({
          style: tabButtonStylesStr,
          class: () => {
            const classes = ["vanui-tab-button"]
            if (tabButtonClass) classes.push(tabButtonClass)
            if (k === activeTabState.val) classes.push("active")
            return classes.join(" ")
          },
          onclick: () => activeTabState.val = k,
        }, k)
      ),
    ),
    Object.entries(contents).map(([k, v]) => div(
      {
        style: () => `display: ${k === activeTabState.val ? "block" : "none"}; ${tabContentStylesStr}`,
        class: tabContentClass,
      },
      v,
    ))
  )
}
