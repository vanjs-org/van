import n from "vanjs-core";
function d(a, o) {
  window.customElements.define(
    a,
    class extends HTMLElement {
      constructor() {
        super();
        const e = {};
        for (let t of this.attributes)
          e[t.name.replace(/-([a-z])/g, (r, s) => s.toUpperCase())] = t.value;
        n.add(this.attachShadow({ mode: "open" }), o(e));
      }
    }
  );
}
export {
  d as create
};
