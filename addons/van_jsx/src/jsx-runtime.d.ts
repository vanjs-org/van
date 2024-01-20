import { JSXElementType, VanElement } from "./createElement";
import { InnerElement, Key, TagOption } from "./type";
export declare namespace JSX {
    type ElementType = string | JSXElementType<any>;
    interface ElementAttributesProperty {
        props: object;
    }
    interface ElementChildrenAttribute {
        children: object;
    }
    interface Element extends VanElement {
    }
    interface IntrinsicAttributes {
        key?: Key;
    }
    type IntrinsicElements = {
        [K in keyof InnerElement]: TagOption<K>;
    };
}
