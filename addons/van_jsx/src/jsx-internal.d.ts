import * as CSS from "csstype";
import { State, ChildDom } from "vanjs-core";
import { FunctionChild } from "./type";

type OriginalElement = HTMLElement;

export declare namespace JSX {
  type JSXProp<T, K extends keyof T> = K extends "children"
    ? ChildDom
    : K extends "style"
    ? CSS.Properties
    : K extends "ref"
    ? State<T>
    : T[K] | (() => T[K]) | State<T[K]>;
  type HTMLAttributes<T> = {
    [K in keyof T]?: JSXProp<T, K>;
  };
  type SVGAttributes<T> = {
    [K in keyof T]?: JSXProp<T, K>;
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
    [K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] extends HTMLElement
      ? HTMLAttributes<HTMLElementTagNameMap[K]>
      : SVGAttributes<HTMLElementTagNameMap[K]>;
  };
}
