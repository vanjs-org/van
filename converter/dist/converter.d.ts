import { RendererObject } from "MarkedOptions";
export interface HtmlToVanCodeOptions {
    indent?: number;
    skipEmptyText?: boolean;
    htmlTagPred?: (name: string) => boolean;
}
export declare const htmlToVanCode: (html: string, { indent, skipEmptyText, htmlTagPred, }?: HtmlToVanCodeOptions) => {
    code: string[];
    tags: string[];
    components: string[];
};
interface MdToVanCodeOptions {
    indent?: number;
    htmlTagPred?: (name: string) => boolean;
    renderer?: RendererObject;
}
export declare const mdToVanCode: (md: string, { indent, htmlTagPred, renderer, }?: MdToVanCodeOptions) => {
    code: string[];
    tags: string[];
    components: string[];
};
export {};
