import { State, ChildDom } from "vanjs-core";

export type PropsWithChildren<TProps> = TProps & {
  children?: ChildDom | undefined;
};

export interface FunctionComponent<TProps = {}> {
  (props: PropsWithChildren<TProps>, context?: any): ChildDom | null;
}

export type ComponentType<TProps = {}> = FunctionComponent<TProps>;
export type FunctionChild<TProps> = (props: TProps) => ChildDom;
