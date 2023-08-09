import van from "vanjs-core";
// Quote all tag names so that they're not mangled by minifier
const { "button": button, "div": div } = van.tags;
const toStyleStr = (style) => Object.entries(style).map(([k, v]) => `${k}: ${v};`).join("");
export const Modal = ({ closed, backgroundColor = "rgba(0,0,0,.5)", blurBackground = false, backgroundClass = "", backgroundStyleOverrides = {}, modalClass = "", modalStyleOverrides = {}, }, ...children) => {
    const backgroundStyle = Object.assign({ display: "flex", "align-items": "center", "justify-content": "center", left: 0, right: 0, top: 0, bottom: 0, position: "fixed", "z-index": 10000, "background-color": backgroundColor, "backdrop-filter": blurBackground ? "blur(0.25rem)" : "none" }, backgroundStyleOverrides);
    const modalStyle = Object.assign({ "border-radius": "0.5rem", padding: "1rem", display: "block", "background-color": "white" }, modalStyleOverrides);
    return () => closed.val ? null : div({ class: backgroundClass, style: toStyleStr(backgroundStyle) }, div({ class: modalClass, style: toStyleStr(modalStyle) }, children));
};
let tabsId = 0;
export const Tabs = ({ activeTab, resultClass = "", style = "", tabButtonRowColor = "#f1f1f1", tabButtonBorderStyle = "1px solid #000", tabButtonHoverColor = "#ddd", tabButtonActiveColor = "#ccc", tabButtonRowClass = "", tabButtonRowStyleOverrides = {}, tabButtonClass = "", tabButtonStyleOverrides = {}, tabContentClass = "", tabContentStyleOverrides = {}, }, contents) => {
    const activeTabState = activeTab !== null && activeTab !== void 0 ? activeTab : van.state(Object.keys(contents)[0]);
    const tabButtonRowStyles = Object.assign({ overflow: "hidden", "background-color": tabButtonRowColor }, tabButtonRowStyleOverrides);
    const tabButtonStyles = Object.assign({ float: "left", border: "none", "border-right": tabButtonBorderStyle, outline: "none", cursor: "pointer", padding: "8px 16px", transition: "0.3s" }, tabButtonStyleOverrides);
    const tabButtonStylesStr = toStyleStr(tabButtonStyles);
    const tabContentStyles = Object.assign({ padding: "6px 12px", "border-top": "none" }, tabContentStyleOverrides);
    const tabContentStylesStr = toStyleStr(tabContentStyles);
    const id = "vanui-tabs-" + (++tabsId);
    van.add(document.head, van.tags["style"](`#${id} .vanui-tab-button { background-color: inherit }
#${id} .vanui-tab-button:hover { background-color: ${tabButtonHoverColor} }
#${id} .vanui-tab-button.active { background-color: ${tabButtonActiveColor} }`));
    return div({ id, class: resultClass, style }, div({ style: toStyleStr(tabButtonRowStyles), class: tabButtonRowClass }, Object.keys(contents).map(k => button({
        style: tabButtonStylesStr,
        class: () => {
            const classes = ["vanui-tab-button"];
            if (tabButtonClass)
                classes.push(tabButtonClass);
            if (k === activeTabState.val)
                classes.push("active");
            return classes.join(" ");
        },
        onclick: () => activeTabState.val = k,
    }, k))), Object.entries(contents).map(([k, v]) => div({
        style: () => `display: ${k === activeTabState.val ? "block" : "none"}; ${tabContentStylesStr}`,
        class: tabContentClass,
    }, v)));
};
