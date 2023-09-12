export interface Options {
    indent?: number;
    skipEmptyText?: boolean;
    htmlTagPred?: (name: string) => boolean;
}
export declare const htmlToVanCode: (html: string, { indent, skipEmptyText, htmlTagPred, }?: Options) => {
    code: string[];
    tags: string[];
    components: string[];
};
