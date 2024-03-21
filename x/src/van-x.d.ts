import type { State } from "vanjs-core"

export declare const calc: <R>(f: () => R) => R
export declare const reactive: <T extends object>(obj: T) => T

export type StateOf<T> = { readonly [K in keyof T]: State<T[K]> }
export declare const stateFields: <T extends object>(obj: T) => StateOf<T>
export declare const raw: <T extends object>(obj: T) => T

export type ValueType<T> = T extends (infer V)[] ? V : T[keyof T]
export type KeyType<T> = T extends unknown[] ? number : string
export declare const list: <T extends object, ElementType extends Element>
  (container: (() => ElementType) | ElementType, items: T,
  itemFunc: (v: State<ValueType<T>>, deleter: () => void, k: KeyType<T>) => Node) => ElementType

export type ReplacementFunc<T> =
  T extends (infer V)[] ? (items: V[]) => readonly V[] :
  (items: [string, T[keyof T]][]) => readonly [string, T[keyof T]][]
export declare const replace: <T extends object>(obj: T, replacement: ReplacementFunc<T> | T) => T

export declare const compact: <T extends object>(obj: T) => T
