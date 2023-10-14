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

export type StateOf<T> = { [K in keyof T]: State<_Reactive<T[K]>> }
export declare const stateFields: <T extends Reactive<object>>(obj: T) => StateOf<DeReactive<T>>

export type ContainerFunc<Result extends Element> = (doms: Node[]) => Result

type ValueOf<T> = T[keyof T]
type ValidKeyed = State<any>[] | Record<string, State<any>> | ReactiveObj
export type ValueType<T extends ValidKeyed> =
  T extends State<infer V>[] ? V :
  T extends Record<string, State<infer V>> ? V :
  T extends Reactive<(infer V)[]> ? V :
  T extends Reactive<infer O> ? ValueOf<DeReactive<O>> : unknown

export declare const list: <T extends ValidKeyed, Result extends Element>
  (containerFunc: ContainerFunc<Result>, items: State<T>,
    itemFunc: (v: State<ValueType<T>>, deleter: () => void) => Node) => Result
