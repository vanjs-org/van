import van from "vanjs-core";
// Quote all tag names so that they're not mangled by minifier
const { "button": button, "div": div, "input": input, "label": label, "span": span } = van.tags;
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
    return div({ id, class: resultClass, style }, div({ class: tabButtonRowClass, style: toStyleStr(tabButtonRowStyles) }, Object.keys(contents).map(k => button({
        class: () => {
            const classes = ["vanui-tab-button"];
            if (tabButtonClass)
                classes.push(tabButtonClass);
            if (k === activeTabState.val)
                classes.push("active");
            return classes.join(" ");
        },
        style: tabButtonStylesStr,
        onclick: () => activeTabState.val = k,
    }, k))), Object.entries(contents).map(([k, v]) => div({
        class: tabContentClass,
        style: () => `display: ${k === activeTabState.val ? "block" : "none"}; ${tabContentStylesStr}`,
    }, v)));
};
export const Toggle = ({ on = false, size = 1, cursor = "pointer", offColor = "#ccc", onColor = "#2196F3", circleColor = "white", toggleClass = "", toggleStyleOverrides = {}, sliderClass = "", sliderStyleOverrides = {}, circleClass = "", circleStyleOverrides = {}, circleWhenOnStyleOverrides = {}, }) => {
    const onState = typeof on === "boolean" ? van.state(on) : on;
    const toggleStyles = Object.assign({ position: "relative", display: "inline-block", width: 1.76 * size + "rem", height: size + "rem", cursor }, toggleStyleOverrides);
    const inputStyles = {
        opacity: 0,
        width: 0,
        height: 0,
        position: "absolute",
        "z-index": 10000, // Ensures the toggle clickable
    };
    const sliderStyles = Object.assign({ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, transition: ".4s", "border-radius": size + "rem" }, sliderStyleOverrides);
    const sliderStylesStr = toStyleStr(sliderStyles);
    const circleStyles = Object.assign({ position: "absolute", height: 0.76 * size + "rem", width: 0.76 * size + "rem", left: 0.12 * size + "rem", bottom: 0.12 * size + "rem", "background-color": circleColor, transition: ".4s", "border-radius": "50%" }, circleStyleOverrides);
    const circleStylesStr = toStyleStr(circleStyles);
    const circleStylesWhenOn = Object.assign({ transform: `translateX(${0.76 * size}rem)` }, circleWhenOnStyleOverrides);
    const circleStylesWhenOnStr = toStyleStr(circleStylesWhenOn);
    return label({ class: toggleClass, style: toStyleStr(toggleStyles) }, input({ type: "checkbox", style: toStyleStr(inputStyles),
        oninput: e => onState.val = e.target.checked }), span({
        class: sliderClass,
        style: () => `${sliderStylesStr}; background-color: ${onState.val ? onColor : offColor};`,
    }, span({
        class: circleClass,
        style: () => circleStylesStr + (onState.val ? circleStylesWhenOnStr : ""),
    })));
};
