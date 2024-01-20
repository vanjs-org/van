export const styleToString = (style) => {
    return Object.entries(style).reduce((acc, key) => acc +
        key[0]
            .split(/(?=[A-Z])/)
            .join("-")
            .toLowerCase() +
        ":" +
        key[1] +
        ";", "");
};
export const setAttribute = (element, key, value) => {
    // Convert Style Object
    if (key === "style") {
        const attr = styleToString(value);
        element.setAttribute(key, attr);
        return;
    }
    if (typeof value === "number") {
        if (key === "tabIndex") {
            element.setAttribute("tabindex", value.toString());
            return;
        }
    }
    // Set String Attribute
    if (typeof value === "string") {
        if (key === "className") {
            element.setAttribute("class", value);
            return;
        }
        if (key === "htmlFor") {
            element.setAttribute("for", value);
            return;
        }
        element.setAttribute(key, value);
        return;
    }
};
