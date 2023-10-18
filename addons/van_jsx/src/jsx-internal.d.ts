import * as CSS from "csstype";
import { State, ChildDom, Tags, Props } from "vanjs-core";
import { FunctionChild } from "./type";

type OriginalElement = HTMLElement;

export declare namespace JSX {
  export interface JSXTags extends HTMLElementTagNameMap {}

  type HTMLAttributes<T> = Partial<Omit<T, "style" | "children">> & {
    style?: CSS.Properties;
    ref?: State<T>;
    children?: ChildDom;
  };
  type SVGAttributes<T> = Partial<Omit<T, "style" | "children">> & {
    style?: CSS.Properties;
    ref?: State<T>;
    children?: ChildDom;
  };
  export type ElementType = string | FunctionChild<any>;
  export interface Element extends OriginalElement {}
  export interface ElementAttributesProperty {
    props: {};
  }
  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface IntrinsicAttributes {}

  export type IntrinsicElements = {
    [K in keyof Tags]: ReturnType<Tags[K]> extends HTMLElement
      ? HTMLAttributes<Props<ReturnType<Tags[K]>>>
      : ReturnType<Tags[K]> extends SVGElement
      ? SVGAttributes<Props<ReturnType<Tags[K]>>>
      : never;
  };
}
