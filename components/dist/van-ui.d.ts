import { ChildDom, State, TagFunc, ValidChildDomValue } from "vanjs-core";
export type CSSPropertyBag = Record<string, string | number>;
export type CSSStyles = Record<string, CSSPropertyBag>;
interface AwaitProps<Value> {
    value: Promise<Value>;
    container?: TagFunc<Element>;
    Loading?: () => ValidChildDomValue;
    Error?: (reason: Error) => ValidChildDomValue;
}
export type AwaitState<Value> = {
    status: "pending";
} | {
    status: "fulfilled";
    value: Value;
} | {
    status: "rejected";
    value: Error;
};
export declare const Await: <T>({ value, container, Loading, Error }: AwaitProps<T>, children: (data: T) => ValidChildDomValue) => Element;
export interface ModalProps {
    readonly closed: State<boolean>;
    readonly backgroundColor?: string;
    readonly blurBackground?: boolean;
    readonly backgroundClass?: string;
    readonly backgroundStyleOverrides?: CSSPropertyBag;
    readonly modalClass?: string;
    readonly modalStyleOverrides?: CSSPropertyBag;
}
export declare const Modal: ({ closed, backgroundColor, blurBackground, backgroundClass, backgroundStyleOverrides, modalClass, modalStyleOverrides, }: ModalProps, ...children: readonly ChildDom[]) => () => HTMLDivElement | null;
export interface TabsProps {
    readonly activeTab?: State<string>;
    readonly resultClass?: string;
    readonly style?: string;
    readonly tabButtonRowColor?: string;
    readonly tabButtonBorderStyle?: string;
    readonly tabButtonHoverColor?: string;
    readonly tabButtonActiveColor?: string;
    readonly transitionSec?: number;
    readonly tabButtonRowClass?: string;
    readonly tabButtonRowStyleOverrides?: CSSPropertyBag;
    readonly tabButtonClass?: string;
    readonly tabButtonStyleOverrides?: CSSPropertyBag;
    readonly tabContentClass?: string;
    readonly tabContentStyleOverrides?: CSSPropertyBag;
}
export declare const Tabs: ({ activeTab, resultClass, style, tabButtonRowColor, tabButtonBorderStyle, tabButtonHoverColor, tabButtonActiveColor, transitionSec, tabButtonRowClass, tabButtonRowStyleOverrides, tabButtonClass, tabButtonStyleOverrides, tabContentClass, tabContentStyleOverrides, }: TabsProps, contents: Record<string, ChildDom>) => HTMLDivElement;
export interface ToggleProps {
    readonly on?: boolean | State<boolean>;
    readonly size?: number;
    readonly cursor?: string;
    readonly offColor?: string;
    readonly onColor?: string;
    readonly circleColor?: string;
    readonly toggleClass?: string;
    readonly toggleStyleOverrides?: CSSPropertyBag;
    readonly sliderClass?: string;
    readonly sliderStyleOverrides?: CSSPropertyBag;
    readonly circleClass?: string;
    readonly circleStyleOverrides?: CSSPropertyBag;
    readonly circleWhenOnStyleOverrides?: CSSPropertyBag;
}
export declare const Toggle: ({ on, size, cursor, offColor, onColor, circleColor, toggleClass, toggleStyleOverrides, sliderClass, sliderStyleOverrides, circleClass, circleStyleOverrides, circleWhenOnStyleOverrides, }: ToggleProps) => HTMLLabelElement;
export interface MessageBoardProps {
    readonly top?: string;
    readonly bottom?: string;
    readonly backgroundColor?: string;
    readonly fontColor?: string;
    readonly fadeOutSec?: number;
    readonly boardClass?: string;
    readonly boardStyleOverrides?: CSSPropertyBag;
    readonly messageClass?: string;
    readonly messageStyleOverrides?: CSSPropertyBag;
    readonly closerClass?: string;
    readonly closerStyleOverrides?: CSSPropertyBag;
}
export interface MessageProps {
    readonly message: ChildDom;
    readonly closer?: ChildDom;
    readonly durationSec?: number;
    readonly closed?: State<boolean>;
}
export declare class MessageBoard {
    private _fadeOutSec;
    private _messageClass;
    private _messageStylesStr;
    private _closerClass;
    private _closerStylesStr;
    private _dom;
    constructor({ top, bottom, backgroundColor, fontColor, fadeOutSec, boardClass, boardStyleOverrides, messageClass, messageStyleOverrides, closerClass, closerStyleOverrides, }: MessageBoardProps, parentDom?: HTMLElement);
    show({ message, closer, durationSec, closed, }: MessageProps): HTMLDivElement;
    remove(): void;
}
export interface TooltipProps {
    readonly text: string | State<string>;
    readonly show: State<boolean>;
    readonly width?: string;
    readonly backgroundColor?: string;
    readonly fontColor?: string;
    readonly fadeInSec?: number;
    readonly tooltipClass?: string;
    readonly tooltipStyleOverrides?: CSSPropertyBag;
    readonly triangleClass?: string;
    readonly triangleStyleOverrides?: CSSPropertyBag;
}
export declare const Tooltip: ({ text, show, width, backgroundColor, fontColor, fadeInSec, tooltipClass, tooltipStyleOverrides, triangleClass, triangleStyleOverrides, }: TooltipProps) => HTMLSpanElement;
export interface OptionGroupProps {
    readonly selected: State<string>;
    readonly normalColor?: string;
    readonly hoverColor?: string;
    readonly selectedColor?: string;
    readonly selectedHoverColor?: string;
    readonly fontColor?: string;
    readonly transitionSec?: number;
    readonly optionGroupClass?: string;
    readonly optionGroupStyleOverrides?: CSSPropertyBag;
    readonly optionClass?: string;
    readonly optionStyleOverrides?: CSSPropertyBag;
}
export declare const OptionGroup: ({ selected, normalColor, hoverColor, selectedColor, selectedHoverColor, fontColor, transitionSec, optionGroupClass, optionGroupStyleOverrides, optionClass, optionStyleOverrides, }: OptionGroupProps, options: readonly string[]) => HTMLDivElement;
export interface BannerProps {
    readonly backgroundColor?: string;
    readonly fontColor?: string;
    readonly sticky?: boolean;
    readonly bannerClass?: string;
    readonly bannerStyleOverrides?: CSSPropertyBag;
}
export declare const Banner: ({ backgroundColor, fontColor, sticky, bannerClass, bannerStyleOverrides, }: BannerProps, ...children: readonly ChildDom[]) => HTMLElement;
export interface FloatingWindowProps {
    readonly title?: ChildDom;
    readonly closed?: State<boolean>;
    readonly x?: number | State<number>;
    readonly y?: number | State<number>;
    readonly width?: number | State<number>;
    readonly height?: number | State<number>;
    readonly closeCross?: ChildDom;
    readonly customStacking?: boolean;
    readonly zIndex?: number | State<number>;
    readonly disableMove?: boolean;
    readonly disableResize?: boolean;
    readonly headerColor?: string;
    readonly windowClass?: string;
    readonly windowStyleOverrides?: CSSPropertyBag;
    readonly headerClass?: string;
    readonly headerStyleOverrides?: CSSPropertyBag;
    readonly childrenContainerClass?: string;
    readonly childrenContainerStyleOverrides?: CSSPropertyBag;
    readonly crossClass?: string;
    readonly crossStyleOverrides?: CSSPropertyBag;
    readonly crossHoverClass?: string;
    readonly crossHoverStyleOverrides?: CSSPropertyBag;
}
export declare const topMostZIndex: () => number;
export declare const FloatingWindow: ({ title, closed, x, y, width, height, closeCross, customStacking, zIndex, disableMove, disableResize, headerColor, windowClass, windowStyleOverrides, headerClass, headerStyleOverrides, childrenContainerClass, childrenContainerStyleOverrides, crossClass, crossStyleOverrides, crossHoverClass, crossHoverStyleOverrides, }: FloatingWindowProps, ...children: readonly ChildDom[]) => () => HTMLDivElement | null;
export {};
