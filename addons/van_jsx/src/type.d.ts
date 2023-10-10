import { State, ChildDom } from "vanjs-core";

type VanElement = Element | ChildDom;

export type PropsWithChildren<P> = P & {
  children?: ComponentChildren | undefined;
};

export interface FunctionComponent<P = {}> {
  (props: PropsWithChildren<P>, context?: any):
    | VanElement
    | VanElement[]
    | null;
}

export type ComponentType<P = {}> = FunctionComponent<P>;
export type FunctionChild<P> = (props: P) => VanElement;
export type ComponentChild =
  | FunctionChild<any>
  | VanElement
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;
