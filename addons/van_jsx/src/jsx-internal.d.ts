import * as CSS from "csstype";
import { State, ChildDom } from "vanjs-core";
import { FunctionChild } from "./type";

type OriginalElement = HTMLElement;
type JSXProp<T, K extends keyof T> = T[K] | (() => T[K]) | State<T[K]>;

export declare namespace JSX {
  type HTMLAttributes<T> = {
    [K in keyof Omit<T, "children" | "style">]?: JSXProp<T, K>;
  } & Partial<{ children: ChildDom; style: CSS.Properties; ref: State<T> }>;

  type SVGAttributes<T> = {
    [K in keyof Omit<T, "children" | "style">]?: JSXProp<T, K>;
  } & Partial<{ children: ChildDom; style: CSS.Properties; ref: State<T> }>;

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
    [K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] extends HTMLElement
      ? HTMLAttributes<HTMLElementTagNameMap[K]>
      : SVGAttributes<HTMLElementTagNameMap[K]>;
  };
}
