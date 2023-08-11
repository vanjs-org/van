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
    readonly [key: string]: ChildDom | ChildDom[];
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
