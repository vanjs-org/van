import van from "vanjs-core";

export function createComponent(name, component, observed = []) {
  window.customElements.define(
    name,
    class extends HTMLElement {
      attrs = {};
      static observedAttributes = observed;
      constructor() {
        super();
      }
      connectedCallback() {
        for (let a of this.attributes) {
          this.attrs[
            a.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
          ] = van.state(a.value);
        }
        van.add(this.attachShadow({ mode: "open" }), () =>
          component(this.attrs)
        );
      }
      attributeChangedCallback(name, _, newValue) {
        if (this.attrs[name]) this.attrs[name].val = newValue;
      }
    }
  );
}
