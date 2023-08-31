import van from "vanjs-core";

export const lazy = (f) => {
  return f;
};

export function createState(v) {
  return van.state(v);
}

export * from "./jsx-runtime";
