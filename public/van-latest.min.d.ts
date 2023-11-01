export interface State<T> {
  val: T
  readonly oldVal: T
}

// Defining readonly view of State<T> for covariance.
// Basically we want StateView<string> to implement StateView<string | number>
export type StateView<T> = Readonly<State<T>>

export type Primitive = string | number | boolean | bigint

export type PropValue = Primitive | ((e: any) => void) | null

export type PropValueOrDerived = PropValue | StateView<PropValue> | (() => PropValue)

export type Props = Record<string, PropValueOrDerived> & { class?: PropValueOrDerived }

type PropsWithKnownKeys<ElementType> = Partial<{[K in keyof ElementType]: PropValueOrDerived}>

export type ValidChildDomValue = Primitive | Node | null | undefined

export type BindingFunc = ((dom?: Node) => ValidChildDomValue) | ((dom?: Element) => Element)

export type ChildDom = ValidChildDomValue | StateView<Primitive | null | undefined> | BindingFunc | readonly ChildDom[]

export type TagFunc<Result> = (first?: Props & PropsWithKnownKeys<Result> | ChildDom, ...rest: readonly ChildDom[]) => Result

type Tags = Readonly<Record<string, TagFunc<Element>>> & {
  [K in keyof HTMLElementTagNameMap]: TagFunc<HTMLElementTagNameMap[K]>
}

export interface Van {
  readonly state: <T>(initVal: T) => State<T>
  readonly val: <T>(s: T | StateView<T>) => T
  readonly oldVal: <T>(s: T | StateView<T>) => T
  readonly derive: <T>(f: () => T) => State<T>
  readonly add: (dom: Element, ...children: readonly ChildDom[]) => Element
  readonly _: (f: () => PropValue) => () => PropValue
  readonly tags: Tags
  readonly tagsNS: (namespaceURI: string) => Readonly<Record<string, TagFunc<Element>>>
  readonly hydrate: <T extends Node>(dom: T, f: (dom: T) => T | null | undefined) => T
}

declare const van: Van

export default van
