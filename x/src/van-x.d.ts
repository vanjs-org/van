import type { State } from "vanjs-core"

declare const reactiveSym: unique symbol
interface ReactiveMarker { [reactiveSym]?: 1 }

type _Reactive<T> = T extends object ?
  T extends Function ? T : { [K in keyof T]: _Reactive<T[K]> } & ReactiveMarker :
  T
export type Reactive<T extends object> = _Reactive<T>
export type DeReactive<T extends ReactiveMarker> = Omit<T, typeof reactiveSym>

export declare const calc: <R>(f: () => R) => R
export declare const reactive: <T extends object>(obj: T) => Reactive<T>

export type StateOf<T> = { [K in keyof T]: State<_Reactive<T[K]>> }
export declare const stateFields: <T extends object>(obj: Reactive<T>) => StateOf<T>

export type ContainerFunc<Result extends Element> = (...dom: Node[]) => Result

type ValueOf<T> = T[keyof T]
type ValidKeyed = Reactive<object> | Record<string, State<any>>
export type ValueType<T extends ValidKeyed> =
  T extends State<infer V>[] ? V :
  T extends Record<string, State<infer V>> ? V :
  T extends Reactive<(infer V)[]> ? V :
  T extends Reactive<infer O> ? ValueOf<DeReactive<O>> : unknown

export declare const keyedItems: <T extends ValidKeyed, Result extends Element>
  (containerFunc: ContainerFunc<Result>, s: State<T>,
    itemFunc: (v: State<ValueType<T>>, deleter: () => void) => Node) => Result
