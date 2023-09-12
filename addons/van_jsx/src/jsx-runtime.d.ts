import * as CSS from "csstype";
import { State } from "vanjs-core";
import { ComponentChildren } from "./type";

export declare const jsx: (
  jsxTag: string | Function,
  {
    children,
    style,
    ref,
    ...props
  }: {
    children?: ComponentChildren;
    style?:
      | CSS.Properties<0 | (string & {}), string & {}>
      | (() => CSS.Properties)
      | undefined;
    ref?: State<Element> | undefined;
  }
) => any;
export { jsx as jsxDEV, jsx as jsxs };
export type { JSX } from "./jsx-internal";
