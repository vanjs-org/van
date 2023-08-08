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
