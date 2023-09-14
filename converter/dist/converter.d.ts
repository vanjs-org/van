import { RendererObject } from "MarkedOptions";
export interface HtmlToVanCodeOptions {
    indent?: number;
    spacing?: boolean;
    skipEmptyText?: boolean;
    htmlTagPred?: (name: string) => boolean;
}
export declare const htmlToVanCode: (html: string, { indent, spacing, skipEmptyText, htmlTagPred, }?: HtmlToVanCodeOptions) => {
    code: string[];
    tags: string[];
    components: string[];
};
interface MdToVanCodeOptions {
    indent?: number;
    spacing?: boolean;
    htmlTagPred?: (name: string) => boolean;
    renderer?: RendererObject;
}
export declare const mdToVanCode: (md: string, { indent, spacing, htmlTagPred, renderer, }?: MdToVanCodeOptions) => {
    code: string[];
    tags: string[];
    components: string[];
};
export {};
