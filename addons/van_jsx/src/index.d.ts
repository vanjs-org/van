import { State, StateView } from "vanjs-core";
export declare function createState<T>(initialValue: T): State<T>;
export declare function createState<T>(initialValue: T | null): StateView<T>;
export declare function createState<T = undefined>(): State<T | undefined>;
export { default as createElement, default as jsx, default as jsxDEV, } from "./createElement";
export * from "./type";
