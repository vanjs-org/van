import type { State } from "vanjs-core"

export declare const statesSym: unique symbol

type TransformField<F> = Reactive<F extends () => infer R ? R : F>

type KnownNonObjectTypes = string | number | boolean | bigint | symbol | null | undefined

type StatesOf<T> = T extends KnownNonObjectTypes ?
  T :
  { [K in Exclude<keyof T, typeof statesSym>]: State<StatesOf<TransformField<T[K]>>> }

type Reactive<T> = T extends KnownNonObjectTypes ?
  T :
  { [K in keyof T]: TransformField<T[K]> } & { [statesSym]: StatesOf<T> }

type D = Reactive<number>
type S = number extends Object ? true : false

export declare const reactive: <T>(obj: T) => Reactive<T>
