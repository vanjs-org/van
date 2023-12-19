import { State } from "vanjs-core";

export declare const createComponent: (
  name: string,
  component: (attributes: Record<string, State<string>>) => HTMLElement,
  observed?: string[]
) => void;
