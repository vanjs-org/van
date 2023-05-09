export type State<T> = {
  val: T
  onnew(l: (val: T, oldVal: T) => void): void
}

// Defining readonly view of State<T> for covariance.
// Basically we want State<string> implements StateView<string | number>
export interface StateView<T> {
  readonly val: T
}

export type Primitive = string | number | boolean | bigint

export type PropValue = Primitive | Function | null

export interface DerivedProp {
  readonly deps: readonly StateView<unknown>[]
  readonly f: (...args: readonly any[]) => PropValue
}

export interface Props {
  readonly [key: string]: PropValue | StateView<PropValue> | DerivedProp
}

export type ChildDom = Primitive | Node | StateView<Primitive | null | undefined> | readonly ChildDom[]

export type TagFunc<Result> = (first?: Props | ChildDom, ...rest: readonly ChildDom[]) => Result

type Tags = {
  readonly [key: string]: TagFunc<Element>
  // Register known element types
  // Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element

  // Main root
  readonly html: TagFunc<HTMLHtmlElement>

  // Document metadata
  readonly base: TagFunc<HTMLBaseElement>
  readonly head: TagFunc<HTMLHeadElement>
  readonly link: TagFunc<HTMLLinkElement>
  readonly meta: TagFunc<HTMLMetaElement>
  readonly style: TagFunc<HTMLStyleElement>
  readonly title: TagFunc<HTMLTitleElement>

  // Sectioning root
  readonly body: TagFunc<HTMLBodyElement>

  // Content sectioning
  readonly h1: TagFunc<HTMLHeadingElement>
  readonly h2: TagFunc<HTMLHeadingElement>
  readonly h3: TagFunc<HTMLHeadingElement>
  readonly h4: TagFunc<HTMLHeadingElement>
  readonly h5: TagFunc<HTMLHeadingElement>
  readonly h6: TagFunc<HTMLHeadingElement>

  // Text content
  readonly blockquote: TagFunc<HTMLQuoteElement>
  readonly div: TagFunc<HTMLDivElement>
  readonly dl: TagFunc<HTMLDListElement>
  readonly hr: TagFunc<HTMLHRElement>
  readonly li: TagFunc<HTMLLIElement>
  readonly menu: TagFunc<HTMLMenuElement>
  readonly ol: TagFunc<HTMLOListElement>
  readonly p: TagFunc<HTMLParagraphElement>
  readonly pre: TagFunc<HTMLPreElement>
  readonly ul: TagFunc<HTMLUListElement>

  // Inline text semantics
  readonly a: TagFunc<HTMLAnchorElement>
  readonly br: TagFunc<HTMLBRElement>
  readonly data: TagFunc<HTMLDataElement>
  readonly q: TagFunc<HTMLQuoteElement>
  readonly span: TagFunc<HTMLSpanElement>
  readonly time: TagFunc<HTMLTimeElement>

  // Image and multimedia
  readonly area: TagFunc<HTMLAreaElement>
  readonly audio: TagFunc<HTMLAudioElement>
  readonly img: TagFunc<HTMLImageElement>
  readonly map: TagFunc<HTMLMapElement>
  readonly track: TagFunc<HTMLTrackElement>
  readonly video: TagFunc<HTMLVideoElement>

  // Embedded content
  readonly embed: TagFunc<HTMLEmbedElement>
  readonly iframe: TagFunc<HTMLIFrameElement>
  readonly object: TagFunc<HTMLObjectElement>
  readonly picture: TagFunc<HTMLPictureElement>
  readonly source: TagFunc<HTMLSourceElement>

  // Scripting
  readonly canvas: TagFunc<HTMLCanvasElement>
  readonly script: TagFunc<HTMLScriptElement>

  // Demarcating edits
  readonly del: TagFunc<HTMLModElement>
  readonly ins: TagFunc<HTMLModElement>

  // Table content
  readonly caption: TagFunc<HTMLTableCaptionElement>
  readonly col: TagFunc<HTMLTableColElement>
  readonly colgroup: TagFunc<HTMLTableColElement>
  readonly table: TagFunc<HTMLTableElement>
  readonly tbody: TagFunc<HTMLTableSectionElement>
  readonly td: TagFunc<HTMLTableCellElement>
  readonly tfoot: TagFunc<HTMLTableSectionElement>
  readonly th: TagFunc<HTMLTableCellElement>
  readonly thead: TagFunc<HTMLTableSectionElement>
  readonly tr: TagFunc<HTMLTableRowElement>

  // Forms
  readonly button: TagFunc<HTMLButtonElement>
  readonly datalist: TagFunc<HTMLDataListElement>
  readonly fieldset: TagFunc<HTMLFieldSetElement>
  readonly form: TagFunc<HTMLFormElement>
  readonly input: TagFunc<HTMLInputElement>
  readonly label: TagFunc<HTMLLabelElement>
  readonly legend: TagFunc<HTMLLegendElement>
  readonly meter: TagFunc<HTMLMeterElement>
  readonly optgroup: TagFunc<HTMLOptGroupElement>
  readonly option: TagFunc<HTMLOptionElement>
  readonly output: TagFunc<HTMLOutputElement>
  readonly progress: TagFunc<HTMLProgressElement>
  readonly select: TagFunc<HTMLSelectElement>
  readonly textarea: TagFunc<HTMLTextAreaElement>

  // Interactive elements
  readonly details: TagFunc<HTMLDetailsElement>
  readonly dialog: TagFunc<HTMLDialogElement>

  // Web Components
  readonly slot: TagFunc<HTMLSlotElement>
  readonly template: TagFunc<HTMLTemplateElement>
}

declare function bind<T1>(d1: StateView<T1>, f: (v1: T1, dom: Element, oldV1: T1) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2>(d1: StateView<T1>, d2: StateView<T2>, f: (v1: T1, v2: T2, dom: Element, oldV1: T1, oldV2: T2) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2, T3>(d1: StateView<T1>, d2: StateView<T2>, d3: StateView<T3>, f: (v1: T1, v2: T2, v3: T3, dom: Element, oldV1: T1, oldV2: T2, oldV3: T3) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2, T3, T4>(d1: StateView<T1>, d2: StateView<T2>, d3: StateView<T3>, d4: StateView<T4>, f: (v1: T1, v2: T2, v3: T3, v4: T4, dom: Element, oldV1: T1, oldV2: T2, oldV3: T3, oldV4: T4) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2, T3, T4, T5>(d1: StateView<T1>, d2: StateView<T2>, d3: StateView<T3>, d4: StateView<T4>, d5: StateView<T5>, f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, dom: Element, oldV1: T1, oldV2: T2, oldV3: T3, oldV4: T4, oldV5: T5) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2, T3, T4, T5, T6>(d1: StateView<T1>, d2: StateView<T2>, d3: StateView<T3>, d4: StateView<T4>, d5: StateView<T5>, d6: StateView<T6>, f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, dom: Element, oldV1: T1, oldV2: T2, oldV3: T3, oldV4: T4, oldV5: T5, oldV6: T6) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2, T3, T4, T5, T6, T7>(d1: StateView<T1>, d2: StateView<T2>, d3: StateView<T3>, d4: StateView<T4>, d5: StateView<T5>, d6: StateView<T6>, d7: StateView<T7>, f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, dom: Element, oldV1: T1, oldV2: T2, oldV3: T3, oldV4: T4, oldV5: T5, oldV6: T6, oldV7: T7) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2, T3, T4, T5, T6, T7, T8>(d1: StateView<T1>, d2: StateView<T2>, d3: StateView<T3>, d4: StateView<T4>, d5: StateView<T5>, d6: StateView<T6>, d7: StateView<T7>, d8: StateView<T8>, f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, dom: Element, oldV1: T1, oldV2: T2, oldV3: T3, oldV4: T4, oldV5: T5, oldV6: T6, oldV7: T7, oldV8: T8) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2, T3, T4, T5, T6, T7, T8, T9>(d1: StateView<T1>, d2: StateView<T2>, d3: StateView<T3>, d4: StateView<T4>, d5: StateView<T5>, d6: StateView<T6>, d7: StateView<T7>, d8: StateView<T8>, d9: StateView<T9>, f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, dom: Element, oldV1: T1, oldV2: T2, oldV3: T3, oldV4: T4, oldV5: T5, oldV6: T6, oldV7: T7, oldV8: T8, oldV9: T9) => Primitive | Node | null | undefined): Node | []
declare function bind<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(d1: StateView<T1>, d2: StateView<T2>, d3: StateView<T3>, d4: StateView<T4>, d5: StateView<T5>, d6: StateView<T6>, d7: StateView<T7>, d8: StateView<T8>, d9: StateView<T9>, d10: StateView<T10>, f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, dom: Element, oldV1: T1, oldV2: T2, oldV3: T3, oldV4: T4, oldV5: T5, oldV6: T6, oldV7: T7, oldV8: T8, oldV9: T9, oldV10: T10) => Primitive | Node | null | undefined): Node | []

export type Van = {
  readonly state: <T>(initVal: T) => State<T>
  readonly add: (dom: Element, ...children: readonly ChildDom[]) => Element
  readonly tags: Tags
  readonly bind: typeof bind
}

declare const van: Van

export default van
