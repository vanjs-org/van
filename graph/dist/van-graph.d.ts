type Options = {
    rankdir?: string;
};
declare const show: (states: Record<string, any> | any[], { rankdir, }?: Options) => Promise<SVGSVGElement>;
export { show };
