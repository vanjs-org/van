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
export declare const list: <T extends ReactiveObj, ElementType extends Element>
  (containerFunc: () => ElementType, items: T,
  itemFunc: (s: State<ValueType<T>>, deleter: () => void) => Node) => ElementType

export type ReplaceFunc<T> =
  T extends (infer V)[] ? (items: V[]) => V[] :
  (items: [string, T[keyof T]][]) => [string, T[keyof T]][]
export declare const replace: <T extends ReactiveObj>(items: T, f: ReplaceFunc<T>) => void
