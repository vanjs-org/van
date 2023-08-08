import { ChildDom, State } from "vanjs-core";
export interface ModalProps {
    readonly closed: State<boolean>;
    readonly backgroundColor?: string;
    readonly blurBackground?: boolean;
    readonly backgroundClass?: string;
    readonly backgroundStyleOverrides?: object;
    readonly modalClass?: string;
    readonly modalStyleOverrides?: object;
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
    readonly tabButtonRowStyleOverrides?: object;
    readonly tabButtonClass?: string;
    readonly tabButtonStyleOverrides?: object;
    readonly tabContentClass?: string;
    readonly tabContentStyleOverrides?: object;
}
export interface TabsContent {
    readonly [key: string]: ChildDom | ChildDom[];
}
export declare const Tabs: ({ activeTab, resultClass, style, tabButtonRowColor, tabButtonBorderStyle, tabButtonHoverColor, tabButtonActiveColor, tabButtonRowClass, tabButtonRowStyleOverrides, tabButtonClass, tabButtonStyleOverrides, tabContentClass, tabContentStyleOverrides, }: TabsProps, contents: TabsContent) => HTMLDivElement;
