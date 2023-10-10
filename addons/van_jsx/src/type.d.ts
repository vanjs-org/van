import { State } from "vanjs-core";

export type PropsWithChildren<P> = P & {
  children?: ComponentChildren | undefined;
};

export interface FunctionComponent<P = {}> {
  (props: PropsWithChildren<P>, context?: any): Element | Element[] | null;
}

export type ComponentType<P = {}> = FunctionComponent<P>;
export type FunctionChild<P> = (props: P) => Element;
export type ComponentChild =
  | State
  | FunctionChild<any>
  | Element
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;
