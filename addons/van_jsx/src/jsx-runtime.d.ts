import * as CSS from "csstype";
import { State, ChildDom } from "vanjs-core";

export declare const jsx: (
  jsxTag: string | Function,
  {
    children,
    style,
    ref,
    ...props
  }: {
    children?: ChildDom;
    style?:
      | CSS.Properties<0 | (string & {}), string & {}>
      | (() => CSS.Properties)
      | undefined;
    ref?: State<Element> | undefined;
  }
) => any;
export { jsx as jsxDEV, jsx as jsxs };
export type { JSX } from "./jsx-internal";
