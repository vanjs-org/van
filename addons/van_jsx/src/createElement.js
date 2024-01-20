import van from "vanjs-core";
import { setAttribute } from "./hyper";
const createElement = (jsxTag, { children, style, ref, ...props }) => {
    if (typeof jsxTag === "string") {
        // TODO VanNode to VanElement
        const ele = van.tags[jsxTag](children);
        for (const [key, value] of Object.entries(props ?? {})) {
            // Auto Update Attribute
            if (typeof value === "function" && !key.startsWith("on")) {
                van.derive(() => {
                    let attr = value();
                    setAttribute(ele, key, attr);
                });
                continue;
            }
            // Add Event Listener
            if (typeof value === "function" && key.startsWith("on")) {
                ele.addEventListener(key.replace("on", "").toLowerCase(), value);
                continue;
            }
            setAttribute(ele, key, value);
            continue;
        }
        if (ref != null) {
            ref.val = ele;
        }
        return ele;
    }
    if (typeof jsxTag === "function") {
        return jsxTag({ ...props, ref, style, children });
    }
};
export default createElement;
