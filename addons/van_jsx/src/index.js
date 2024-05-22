import van from "vanjs-core";
export function createState(v) {
    return van.state(v);
}
export function Fragment({children}) {
    return children;
}
export { default as createElement, default as jsx, default as jsxs, default as jsxDEV, } from "./createElement";
