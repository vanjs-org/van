import s from "vanjs-core";
function m(o, a) {
  window.customElements.define(
    o,
    class extends HTMLElement {
      constructor() {
        super();
        const e = {};
        for (let t of this.attributes)
          e[t.name.replace(/-([a-z])/g, (r, n) => n.toUpperCase())] = t.value;
        s.add(this.attachShadow({ mode: "open" }), a(e));
      }
    }
  );
}
export {
  m as createComponent
};
