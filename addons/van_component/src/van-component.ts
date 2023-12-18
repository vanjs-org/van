import van from "vanjs-core";

export function create(
  name: string,
  component: (props: Record<string, string>) => HTMLElement
) {
  window.customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super();
        const attrs: Record<string, string> = {};
        for (let a of this.attributes) {
          attrs[
            a.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
          ] = a.value;
        }
        van.add(this.attachShadow({ mode: "open" }) as any, component(attrs));
      }
    }
  );
}
