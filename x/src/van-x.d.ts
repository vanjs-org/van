import type { State } from "vanjs-core"

declare const reactiveSym: unique symbol
interface ReactiveMarker { reactiveSym?: 1 }

export type Reactive<T> = T extends object ?
  T extends Function ? T : { [K in keyof T]: Reactive<T[K]> } & ReactiveMarker :
  T

export declare const calc: <R>(f: () => R) => R
export declare const reactive: <T extends object>(obj: T) => Reactive<T>
export type StateOf<T> = { [K in keyof T]: State<Reactive<T[K]>> }
export declare const stateFields: <T extends object>(obj: Reactive<T>) => StateOf<T>
