import van from "vanjs-core";
// Quote all tag names so that they're not mangled by minifier
const { "button": button, "div": div, "header": header, "input": input, "label": label, "span": span, "style": style } = van.tags;
const toStyleStr = (style) => Object.entries(style).map(([k, v]) => `${k}: ${v};`).join("");
const toStyleSheet = (styles) => {
    return Object.entries(styles)
        .map(([selector, props]) => `${selector} { ${toStyleStr(props)} }`)
        .join("\n");
};
const stateProto = Object.getPrototypeOf(van.state(null));
const stateOf = (v) => (Object.getPrototypeOf(v ?? 0) === stateProto ? v : van.state(v));
export const Await = ({ value, container = div, Loading, Error }, children) => {
    const data = van.state({ status: "pending" });
    value
        .then(result => data.val = { status: "fulfilled", value: result })
        .catch(err => data.val = { status: "rejected", value: err });
    return container(() => data.val.status === "pending" ? Loading?.() ?? "" :
        data.val.status === "rejected" ? Error?.(data.val.value) :
            children(data.val.value));
};
export const Modal = ({ closed, backgroundColor = "rgba(0,0,0,.5)", blurBackground = false, backgroundClass = "", backgroundStyleOverrides = {}, modalClass = "", modalStyleOverrides = {}, }, ...children) => {
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
    };
    const modalStyle = {
        "border-radius": "0.5rem",
        padding: "1rem",
        display: "block",
        "background-color": "white",
        ...modalStyleOverrides,
    };
    return () => closed.val ? null : div({ class: backgroundClass, style: toStyleStr(backgroundStyle) }, div({ class: modalClass, style: toStyleStr(modalStyle) }, children));
};
let tabsId = 0;
export const Tabs = ({ activeTab, resultClass = "", style = "", tabButtonRowColor = "#f1f1f1", tabButtonBorderStyle = "1px solid #000", tabButtonHoverColor = "#ddd", tabButtonActiveColor = "#ccc", transitionSec = 0.3, tabButtonRowClass = "", tabButtonRowStyleOverrides = {}, tabButtonClass = "", tabButtonStyleOverrides = {}, tabContentClass = "", tabContentStyleOverrides = {}, }, contents) => {
    const activeTabState = activeTab ?? van.state(Object.keys(contents)[0]);
    const tabButtonRowStylesStr = toStyleStr({
        overflow: "hidden",
        "background-color": tabButtonRowColor,
        ...tabButtonRowStyleOverrides,
    });
    const tabButtonStylesStr = toStyleStr({
        float: "left",
        border: "none",
        "border-right": tabButtonBorderStyle,
        outline: "none",
        cursor: "pointer",
        padding: "8px 16px",
        transition: `background-color ${transitionSec}s`,
        ...tabButtonStyleOverrides,
    });
    const tabContentStylesStr = toStyleStr({
        padding: "6px 12px",
        "border-top": "none",
        ...tabContentStyleOverrides,
    });
    const id = "vanui-tabs-" + (++tabsId);
    document.head.appendChild(van.tags["style"](`#${id} .vanui-tab-button { background-color: inherit }
#${id} .vanui-tab-button:hover { background-color: ${tabButtonHoverColor} }
#${id} .vanui-tab-button.active { background-color: ${tabButtonActiveColor} }`));
    return div({ id, class: resultClass, style }, div({ class: tabButtonRowClass, style: tabButtonRowStylesStr }, Object.keys(contents).map(k => button({
        class: () => ["vanui-tab-button"].concat(tabButtonClass ? tabButtonClass : [], k === activeTabState.val ? "active" : []).join(" "),
        style: tabButtonStylesStr,
        onclick: () => activeTabState.val = k,
    }, k))), Object.entries(contents).map(([k, v]) => div({
        class: tabContentClass,
        style: () => `display: ${k === activeTabState.val ? "block" : "none"}; ${tabContentStylesStr}`,
    }, v)));
};
export const Toggle = ({ on = false, size = 1, cursor = "pointer", offColor = "#ccc", onColor = "#2196F3", circleColor = "white", toggleClass = "", toggleStyleOverrides = {}, sliderClass = "", sliderStyleOverrides = {}, circleClass = "", circleStyleOverrides = {}, circleWhenOnStyleOverrides = {}, }) => {
    const onState = stateOf(on);
    const toggleStylesStr = toStyleStr({
        position: "relative",
        display: "inline-block",
        width: 1.76 * size + "rem",
        height: size + "rem",
        cursor,
        ...toggleStyleOverrides,
    });
    const inputStylesStr = toStyleStr({
        opacity: 0,
        width: 0,
        height: 0,
        position: "absolute",
        "z-index": 10000, // Ensures the toggle clickable
    });
    const sliderStylesStr = toStyleStr({
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transition: ".4s",
        "border-radius": size + "rem",
        ...sliderStyleOverrides,
    });
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
    });
    const circleStylesWhenOnStr = toStyleStr({
        transform: `translateX(${0.76 * size}rem)`,
        ...circleWhenOnStyleOverrides,
    });
    return label({ class: toggleClass, style: toggleStylesStr }, input({ type: "checkbox", style: inputStylesStr, oninput: e => onState.val = e.target.checked }), span({
        class: sliderClass,
        style: () => `${sliderStylesStr}; background-color: ${onState.val ? onColor : offColor};`,
    }, span({
        class: circleClass,
        style: () => circleStylesStr + (onState.val ? circleStylesWhenOnStr : ""),
    })));
};
export class MessageBoard {
    _fadeOutSec;
    _messageClass;
    _messageStylesStr;
    _closerClass;
    _closerStylesStr;
    _dom;
    constructor({ top = "unset", bottom = "unset", backgroundColor = "#333D", fontColor = "white", fadeOutSec = 0.3, boardClass = "", boardStyleOverrides = {}, messageClass = "", messageStyleOverrides = {}, closerClass = "", closerStyleOverrides = {}, }, parentDom = document.body) {
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
        });
        this._fadeOutSec = fadeOutSec;
        this._messageClass = messageClass;
        this._messageStylesStr = toStyleStr({
            display: "flex",
            "background-color": backgroundColor,
            color: fontColor,
            padding: "15px",
            "margin-bottom": "10px",
            "border-radius": "5px",
            transition: `opacity ${fadeOutSec}s, transform ${fadeOutSec}s`,
            ...messageStyleOverrides,
        });
        this._closerClass = closerClass;
        this._closerStylesStr = toStyleStr({
            display: "flex",
            "align-items": "center",
            "margin-left": "10px",
            cursor: "pointer",
            ...closerStyleOverrides
        });
        parentDom.appendChild(this._dom = div({ class: boardClass, style: boardStylesStr }));
    }
    show({ message, closer, durationSec, closed = van.state(false), }) {
        const removed = van.state(false);
        van.derive(() => setTimeout((v) => removed.val = v, this._fadeOutSec * 1000, closed.val));
        const msgDom = div({ class: this._messageClass, style: this._messageStylesStr }, div(message), closer ? div({ class: this._closerClass, style: this._closerStylesStr, onclick: () => closed.val = true }, closer) : null);
        van.derive(() => closed.val && (msgDom.style.opacity = "0", msgDom.style.transform = "translateY(-20px)"));
        if (durationSec)
            setTimeout(() => closed.val = true, durationSec * 1000);
        van.add(this._dom, () => removed.val ? null : msgDom);
        return msgDom;
    }
    remove() { this._dom.remove(); }
}
export const Tooltip = ({ text, show, width = "200px", backgroundColor = "#333D", fontColor = "white", fadeInSec = 0.3, tooltipClass = "", tooltipStyleOverrides = {}, triangleClass = "", triangleStyleOverrides = {}, }) => {
    const tooltipStylesStr = toStyleStr({
        width,
        visibility: "hidden",
        "background-color": backgroundColor,
        color: fontColor,
        "text-align": "center",
        padding: "5px",
        "border-radius": "5px",
        position: "absolute",
        "z-index": 1,
        bottom: "125%",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: 0,
        transition: `opacity ${fadeInSec}s`,
        ...tooltipStyleOverrides,
    });
    const triangleStylesStr = toStyleStr({
        width: 0,
        height: 0,
        "margin-left": "-5px",
        "border-left": "5px solid transparent",
        "border-right": "5px solid transparent",
        "border-top": "5px solid #333",
        position: "absolute",
        bottom: "-5px",
        left: "50%",
        ...triangleStyleOverrides,
    });
    const dom = span({ class: tooltipClass, style: tooltipStylesStr }, text, div({ class: triangleClass, style: triangleStylesStr }));
    van.derive(() => show.val ?
        (dom.style.opacity = "1", dom.style.visibility = "visible") :
        (dom.style.opacity = "0", dom.style.visibility = "hidden"));
    return dom;
};
let optionGroupId = 0;
export const OptionGroup = ({ selected, normalColor = "#e2eef7", hoverColor = "#c1d4e9", selectedColor = "#90b6d9", selectedHoverColor = "#7fa5c8", fontColor = "black", transitionSec = 0.3, optionGroupClass = "", optionGroupStyleOverrides = {}, optionClass = "", optionStyleOverrides = {}, }, options) => {
    const buttonGroupStylesStr = toStyleStr({
        display: "flex",
        ...optionGroupStyleOverrides,
    });
    const buttonStylesStr = toStyleStr({
        padding: "10px 20px",
        border: "none",
        color: fontColor,
        cursor: "pointer",
        outline: "none",
        transition: `background-color ${transitionSec}s`,
        ...optionStyleOverrides,
    });
    const id = "vanui-option-group-" + (++optionGroupId);
    document.head.appendChild(van.tags["style"](`#${id} .vanui-button { background-color: ${normalColor} }
#${id} .vanui-button:hover { background-color: ${hoverColor} }
#${id} .vanui-button.selected { background-color: ${selectedColor} }
#${id} .vanui-button.selected:hover { background-color: ${selectedHoverColor} }`));
    return div({ id, class: optionGroupClass, style: buttonGroupStylesStr }, options.map(o => button({
        class: () => ["vanui-button"].concat(optionClass ? optionClass : [], o === selected.val ? "selected" : []).join(" "),
        style: buttonStylesStr,
        onclick: () => selected.val = o,
    }, o)));
};
export const Banner = ({ backgroundColor = "#fff1a8", fontColor = "currentcolor", sticky = false, bannerClass = "", bannerStyleOverrides = {}, }, ...children) => {
    const bannerStyleStr = toStyleStr({
        "background-color": backgroundColor,
        color: fontColor,
        top: 0,
        position: sticky ? "sticky" : "static",
        "z-index": 10,
        ...bannerStyleOverrides,
    });
    return header({ class: bannerClass, style: bannerStyleStr }, children);
};
let curWindowZIndex = 0;
export const topMostZIndex = () => ++curWindowZIndex;
export const FloatingWindow = ({ title, closed = van.state(false), x = 100, y = 100, width = 300, height = 200, closeCross = "×", customStacking = false, zIndex = 1, disableMove = false, disableResize = false, headerColor = "lightgray", windowClass = "", windowStyleOverrides = {}, headerClass = "", headerStyleOverrides = {}, childrenContainerClass = "", childrenContainerStyleOverrides = {}, crossClass = "", crossStyleOverrides = {}, crossHoverClass = "", crossHoverStyleOverrides = {}, }, ...children) => {
    const xState = stateOf(x), yState = stateOf(y);
    const widthState = stateOf(width), heightState = stateOf(height);
    const zIndexState = stateOf(zIndex);
    if (!customStacking)
        zIndexState.val = topMostZIndex();
    const dragging = van.state(false), resizingDirection = van.state(null);
    const startX = van.state(0), startY = van.state(0);
    const startWidth = van.state(0), startHeight = van.state(0);
    const crossHover = crossHoverClass || Object.keys(crossHoverStyleOverrides) ?
        van.state(false) : null;
    const onmousedown = (e) => {
        if (e.button !== 0)
            return;
        dragging.val = true;
        startX.val = e.clientX;
        startY.val = e.clientY;
        document.body.style.userSelect = "none";
    };
    const onResizeMouseDown = (direction) => (e) => {
        resizingDirection.val = direction;
        startX.val = e.clientX;
        startY.val = e.clientY;
        startWidth.val = widthState.val;
        startHeight.val = heightState.val;
        document.body.style.userSelect = "none";
    };
    const onMouseMove = (e) => {
        if (dragging.val) {
            xState.val += e.clientX - startX.val;
            yState.val += e.clientY - startY.val;
            startX.val = e.clientX;
            startY.val = e.clientY;
        }
        else if (resizingDirection.val) {
            const deltaX = e.clientX - startX.val;
            const deltaY = e.clientY - startY.val;
            if (resizingDirection.val.includes("right"))
                widthState.val = startWidth.val + deltaX;
            if (resizingDirection.val.includes("bottom"))
                heightState.val = startHeight.val + deltaY;
        }
    };
    const onMouseUp = () => {
        dragging.val = false;
        resizingDirection.val = null;
        document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    const grabAreaBgColor = "transparent";
    if (!document.getElementById("vanui-window-style")) {
        const staticStyles = style({ type: "text/css", id: "vanui-window-style" }, toStyleSheet({
            ".vanui-window": {
                position: "fixed",
                "background-color": "white",
                border: "1px solid black",
                "border-radius": "0.5rem",
                overflow: "hidden",
            },
            ".vanui-window-dragarea": {
                cursor: "move",
                position: "absolute",
                left: "0",
                top: "0",
                width: "100%",
                height: "1rem",
            },
            ".vanui-window-resize-right": {
                cursor: "e-resize",
                position: "absolute",
                right: "0",
                top: "0",
                width: "10px",
                height: "100%",
                "background-color": grabAreaBgColor,
            },
            ".vanui-window-resize-bottom": {
                cursor: "s-resize",
                position: "absolute",
                left: "0",
                bottom: "0",
                width: "100%",
                height: "10px",
                "background-color": grabAreaBgColor,
            },
            ".vanui-window-resize-rightbottom": {
                cursor: "se-resize",
                position: "absolute",
                right: "0",
                bottom: "0",
                width: "10px",
                height: "10px",
                "background-color": grabAreaBgColor,
            },
            ".vanui-window-header": {
                cursor: "move",
                "user-select": "none",
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center",
                padding: "0.5rem",
            },
            ".vanui-window-cross": {
                cursor: "pointer",
                "font-family": "Arial",
                transition: "background-color 0.3s, color 0.3s",
                "border-radius": "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
            },
            ".vanui-window-cross:hover": {
                "background-color": "red",
                color: "white",
            },
            ".vanui-window-children": {
                padding: "0.5rem",
            }
        }));
        document.head.appendChild(staticStyles);
    }
    return () => closed.val ? null : div({
        class: ["vanui-window"].concat(windowClass ? windowClass : []).join(" "),
        style: () => toStyleStr({
            left: `${xState.val}px`,
            top: `${yState.val}px`,
            width: `${widthState.val}px`,
            height: `${heightState.val}px`,
            "z-index": zIndexState.val,
            ...windowStyleOverrides,
        }),
        ...(customStacking ? {} : { onmousedown: () => zIndexState.val = topMostZIndex() }),
    }, title ? header({
        class: ["vanui-window-header"].concat(headerClass ? headerClass : []).join(" "),
        style: toStyleStr({
            "background-color": headerColor,
            ...(disableMove ? { cursor: "auto" } : {}),
            ...headerStyleOverrides,
        }),
        ...(disableMove ? {} : { onmousedown }),
    }, title, closeCross ? span({
        class: () => ["vanui-window-cross"]
            .concat(crossClass ? crossClass : [])
            .concat(crossHoverClass && crossHover.val ? crossHoverClass : [])
            .join(" "),
        style: () => toStyleStr({
            ...crossStyleOverrides,
            ...(Object.keys(crossHoverStyleOverrides).length && crossHover.val ?
                crossHoverStyleOverrides : {}),
        }),
        onclick: () => closed.val = true,
        ...(crossHover ? {
            onmouseenter: () => crossHover.val = true,
            onmouseleave: () => crossHover.val = false,
        } : {})
    }, closeCross) : null) : disableMove ? null : div({
        class: "vanui-window-dragarea",
        onmousedown,
    }), disableResize ? [] : [
        div({
            class: "vanui-window-resize-right",
            onmousedown: onResizeMouseDown("right"),
        }),
        div({
            class: "vanui-window-resize-bottom",
            onmousedown: onResizeMouseDown("bottom"),
        }),
        div({
            class: "vanui-window-resize-rightbottom",
            onmousedown: onResizeMouseDown("rightbottom"),
        }),
    ], div({
        class: ["vanui-window-children"].concat(childrenContainerClass ? childrenContainerClass : []).join(" "),
        style: toStyleStr(childrenContainerStyleOverrides)
    }, children));
};
