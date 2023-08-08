import van from "vanjs-core";
// Quote all tag names so that they're not mangled by minifier
const { "div": div } = van.tags;
const toStyleString = (style) => Object.entries(style).map(([k, v]) => `${k}: ${v};`).join("");
export const Modal = ({ closed, backgroundColor = "rgba(0,0,0,.5)", blurBackground = false, backgroundClass = "", backgroundStyleOverrides = {}, modalClass = "", modalStyleOverrides = {}, }, ...children) => {
    const backgroundStyle = Object.assign({ display: "flex", "align-items": "center", "justify-content": "center", left: 0, right: 0, top: 0, bottom: 0, position: "fixed", "z-index": 10000, "background-color": backgroundColor, "backdrop-filter": blurBackground ? "blur(0.25rem)" : "none" }, backgroundStyleOverrides);
    const modalStyle = Object.assign({ "border-radius": "0.5rem", padding: "1rem", display: "block", "background-color": "white" }, modalStyleOverrides);
    return () => closed.val ? null : div({ class: backgroundClass, style: toStyleString(backgroundStyle) }, div({ class: modalClass, style: toStyleString(modalStyle) }, children));
};
