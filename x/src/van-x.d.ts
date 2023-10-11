import type { State } from "vanjs-core"

export declare const calc: <R>(f: () => R) => R
export declare const reactive: <T extends object>(obj: T) => T
export declare const stateFields: <T extends object>(obj: T) => { [K in keyof T]: State<T[K]> }
