import van from "vanjs-core";

const styleToString = (style) => {
  return Object.entries(style).reduce(
    (acc, key) =>
      acc +
      key[0]
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      key[1] +
      ";",
    ""
  );
};

const mergeStyle = (props, style) => {
  if (typeof style === "function") {
    return {
      ...props,
      style: () => {
        return styleToString(style());
      },
    };
  }
  if (style == null) {
    return props;
  }
  return {
    ...props,
    style: styleToString(style),
  };
};

export const jsx = (jsxTag, { children, style, ref, ...props }) => {
  if (typeof jsxTag === "string") {
    const ele = van.tags[jsxTag](mergeStyle(props, style), children);
    if (ref != null) {
      ref.val = ele;
    }
    return ele;
  }
  if (typeof jsxTag === "function") {
    return jsxTag({ ...props, ref, style, children });
  }
};

export { jsx as jsxDEV, jsx as jsxs };
