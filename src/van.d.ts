export interface State<T> {
  val: T;
  readonly oldVal: T;
}

// Defining readonly view of State<T> for covariance.
// Basically we want StateView<string> to implement StateView<string | number>
export type StateView<T> = Readonly<State<T>>;

export type Primitive = string | number | boolean | bigint;

export type PropValue<TProp = any> = TProp | StateView<TProp> | (() => TProp);

export type Props<TElement extends Element> = Partial<{
  [K in keyof TElement]: PropValue<TElement[K]>;
}>;

export type ValidChildDomValue = Primitive | Node | null | undefined;

export type BindingFunc = (dom?: Element) => Element;

export type ChildDom =
  | ValidChildDomValue
  | StateView<Primitive | null | undefined>
  | BindingFunc
  | readonly ChildDom[];

export type VanElement<TElement extends Element> = (
  first?: Props<TElement> | ChildDom,
  ...rest: readonly ChildDom[]
) => TElement;

export type Tags = {
  [K in keyof HTMLElementTagNameMap]: VanElement<HTMLElementTagNameMap[K]>;
};

export interface Van {
  readonly state: <T>(initVal: T) => State<T>;
  readonly val: <T>(s: T | StateView<T>) => T;
  readonly oldVal: <T>(s: T | StateView<T>) => T;
  readonly derive: <T>(f: () => T) => State<T>;
  readonly add: (dom: Element, ...children: readonly ChildDom[]) => Element;
  readonly _: <TProp = any>(
    f: () => PropValue<TProp>
  ) => () => PropValue<TProp>;
  readonly tags: Tags;
  readonly tagsNS: (
    namespaceURI: string
  ) => Readonly<Record<string, VanElement<Element>>>;
  readonly hydrate: <T extends Node>(
    dom: T,
    f: (dom: T) => T | null | undefined
  ) => T;
}

declare const van: Van;

export default van;
