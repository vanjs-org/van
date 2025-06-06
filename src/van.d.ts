export interface State<T> {
  val: T
  readonly oldVal: T
  readonly rawVal: T
}

// Defining readonly view of State<T> for covariance.
// Basically we want StateView<string> to implement StateView<string | number>
export type StateView<T> = Readonly<State<T>>

export type Val<T> = State<T> | T

export type Primitive = string | number | boolean | bigint

export type PropValue = Primitive | ((e: any) => void) | null

export type PropValueOrDerived = PropValue | StateView<PropValue> | (() => PropValue)

export type PropValueXmlNS =
  | "http://www.w3.org/1999/xhtml"
  | "http://www.w3.org/2000/svg"
  | "http://www.w3.org/1998/Math/MathML"
  | (string & {})

export type Props = Record<string, PropValueOrDerived> & { xmlns?: PropValueXmlNS; class?: PropValueOrDerived; is?: string }

export type PropsWithKnownKeys<ElementType> = Partial<{[K in keyof ElementType]: PropValueOrDerived}>

export type ValidChildDomValue = Primitive | Node | null | undefined

export type BindingFunc = ((dom?: Node) => ValidChildDomValue) | ((dom?: Element) => Element)

export type ChildDom = ValidChildDomValue | StateView<Primitive | null | undefined> | BindingFunc | readonly ChildDom[]

export type TagFunc<Result> = (first?: Props & PropsWithKnownKeys<Result> | ChildDom, ...rest: readonly ChildDom[]) => Result

type Tags = Readonly<Record<string, TagFunc<Element>>> & {
  [K in keyof HTMLElementTagNameMap]: TagFunc<HTMLElementTagNameMap[K]>
}

declare function state<T>(): State<T>
declare function state<T>(initVal: T): State<T>

export interface Van {
  readonly state: typeof state
  readonly derive: <T>(f: () => T) => State<T>
  readonly add: (dom: Element | DocumentFragment, ...children: readonly ChildDom[]) => Element
  readonly tags: Tags & (<K extends keyof Tags>(name: K, ...rest: Parameters<Tags[K]>) => ReturnType<Tags[K]>)
  readonly withNS: <T>(ns: PropValueXmlNS, f: (ns: PropValueXmlNS) => T) => T;
  readonly hydrate: <T extends Node>(dom: T, f: (dom: T) => T | null | undefined) => T
}

declare const van: Van

export default van
