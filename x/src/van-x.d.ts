import type { State } from "vanjs-core"

declare const reactiveSym: unique symbol
export interface ReactiveObj { [reactiveSym]: never }

type _Reactive<T> = T extends object ?
  T extends Function ? T : T & ReactiveObj :
  T

export type Reactive<T extends object> = _Reactive<T>
export type DeReactive<T> = T extends ReactiveObj ? Omit<T, typeof reactiveSym> : T

export declare const calc: <R>(f: () => R) => R
export declare const reactive: <T extends object>(obj: T) => Reactive<T>

export type StateOf<T> = { readonly [K in keyof T]: State<_Reactive<T[K]>> }
export declare const stateFields: <T extends ReactiveObj>(obj: T) => StateOf<DeReactive<T>>

export type ValueType<T> = T extends (infer V)[] ? V : T[keyof T]
export type KeyType<T> = T extends unknown[] ? number : T[keyof T]
export declare const list: <T extends ReactiveObj, ElementType extends Element>
  (containerFunc: () => ElementType, items: T,
  itemFunc: (v: State<ValueType<T>>, deleter: () => void, k: KeyType<T>) => Node) => ElementType

export type ReplaceFunc<T> =
  T extends (infer V)[] ? (items: V[]) => readonly V[] :
  (items: [string, T[keyof T]][]) => readonly [string, T[keyof T]][]
export declare const replace: <T extends ReactiveObj>(items: T, f: ReplaceFunc<T>) => void
