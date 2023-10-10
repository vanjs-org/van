import type { State } from "vanjs-core"

type TransformField<F> = Reactive<F extends () => infer R ? R : F>

type KnownNonObjectTypes = string | number | boolean | bigint | symbol | null | undefined

type StatesOf<T> = T extends KnownNonObjectTypes ?
  T :
  { [K in keyof T]: State<StatesOf<TransformField<T[K]>>> }

type Reactive<T> = T extends KnownNonObjectTypes ?
  T :
  { [K in keyof T]: TransformField<T[K]> }

export declare const reactive: <T>(obj: T) => Reactive<T>
export declare const stateFields: <T>(obj: T) => StatesOf<T>
