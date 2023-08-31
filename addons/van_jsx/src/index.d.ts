import { State, StateView } from "vanjs-core";

export declare const lazy: <T>(f: () => T) => T;
export declare function createState<T>(initialValue: T): State<T>;
export declare function createState<T>(
  initialValue: T | null
): StateView<T>;
export declare function createState<T = undefined>(): State<T | undefined>;
export * from "./jsx-runtime";
export * from "./type";
