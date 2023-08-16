import { ChildDom, State } from "vanjs-core";
export interface CSSPropertyBag {
    readonly [key: string]: string | number;
}
export interface ModalProps {
    readonly closed: State<boolean>;
    readonly backgroundColor?: string;
    readonly blurBackground?: boolean;
    readonly backgroundClass?: string;
    readonly backgroundStyleOverrides?: CSSPropertyBag;
    readonly modalClass?: string;
    readonly modalStyleOverrides?: CSSPropertyBag;
}
export declare const Modal: ({ closed, backgroundColor, blurBackground, backgroundClass, backgroundStyleOverrides, modalClass, modalStyleOverrides, }: ModalProps, ...children: readonly ChildDom[]) => () => HTMLDivElement;
export interface TabsProps {
    readonly activeTab?: State<string> | undefined;
    readonly resultClass?: string;
    readonly style?: string;
    readonly tabButtonRowColor?: string;
    readonly tabButtonBorderStyle?: string;
    readonly tabButtonHoverColor?: string;
    readonly tabButtonActiveColor?: string;
    readonly tabButtonRowClass?: string;
    readonly tabButtonRowStyleOverrides?: CSSPropertyBag;
    readonly tabButtonClass?: string;
    readonly tabButtonStyleOverrides?: CSSPropertyBag;
    readonly tabContentClass?: string;
    readonly tabContentStyleOverrides?: CSSPropertyBag;
}
export interface TabsContent {
    readonly [key: string]: ChildDom | readonly ChildDom[];
}
export declare const Tabs: ({ activeTab, resultClass, style, tabButtonRowColor, tabButtonBorderStyle, tabButtonHoverColor, tabButtonActiveColor, tabButtonRowClass, tabButtonRowStyleOverrides, tabButtonClass, tabButtonStyleOverrides, tabContentClass, tabContentStyleOverrides, }: TabsProps, contents: TabsContent) => HTMLDivElement;
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
    readonly message: ChildDom | readonly ChildDom[];
    readonly closer?: ChildDom | readonly ChildDom[];
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
