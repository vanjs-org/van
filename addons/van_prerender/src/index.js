import van from "vanjs-core";

const VOID_TAGS = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/
const NO_ESCAPE_TAGS = /^(?:script|style)$/
const BOOLEAN_ATTRS = /^(?:async|autofocus|autoplay|checked|controls|default|defer|disabled|formnovalidate|hidden|ismap|itemscope|loop|multiple|muted|nomodule|novalidate|open|playsinline|readonly|required|reversed|selected|seamless|truespeed)$/
const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
}

const toEscapeString = (x) =>
  x.replace(/[&<>]/g, (tag) => ESCAPE_MAP[tag] || tag).replace(/\s\s+/g, " ")

class PrerenderElement {
  namespaceURI
  tagName
  nodeType = 1
  attributes = {}
  children = []
  isRemoved
  overrideOuterHTML
  overrideInnerHTML
  constructor(namespaceURI, tagName) {
    this.namespaceURI = namespaceURI
    this.tagName = tagName
  }
  get innerHTML() {
    if (this.isRemoved)
      return ""
    if (this.overrideInnerHTML)
      return this.overrideInnerHTML
    const grpChildren = []
    for (const child of this.children) {
      if (
        !grpChildren.length
        || child instanceof PrerenderElement
        || grpChildren[grpChildren.length - 1] instanceof PrerenderElement
      ) {
        grpChildren.push(child)
      } else {
        grpChildren[grpChildren.length - 1] += child
      }
    }
    return grpChildren
      .map(
        !this.namespaceURI
        && NO_ESCAPE_TAGS.test(this.tagName)
          ? (x) => x.toString()
          : (x) => x instanceof PrerenderElement
            ? x.toString()
            : toEscapeString(x))
      .join("")
  }
  set innerHTML(v) {
    this.overrideInnerHTML = v
  }
  get outerHTML() {
    return this.isRemoved ? "" : this.overrideOuterHTML ?? `<${
      [
        this.tagName,
        ...Object.entries(this.attributes)
          .map(([k, v]) =>
            !this.namespaceURI && BOOLEAN_ATTRS.test(k)
              ? (v ? k : "")
              : `${k}=${JSON.stringify(String(v).replace(/"/g, "&quot;"))}`)
      ].filter(x=>x).join(" ")
    }${
      !this.namespaceURI && VOID_TAGS.test(this.tagName)
        ? ""
        : this.namespaceURI && !this.innerHTML
          ? "/"
          : `>${this.innerHTML}</${this.tagName}`
    }>`
  }
  set outerHTML(v) {
    this.overrideOuterHTML = v
  }
  get className() {
    return this.attributes["class"]
  }
  set className(name) {
    this.attributes["class"] = name
  }
  setAttribute(name, value) {
    this.attributes[name] = value
  }
  addEventListener(event, callback) {
    typeof callback == "string"
      && (this.setAttribute(`on${event}`, callback))
  }
  removeEventListener() {}
  append(...items) {
    this.children.push(...items)
  }
  replaceWith(item) {
    if (item instanceof PrerenderElement) {
      if (item.isRemoved)
        return this.remove()
      this.tagName = item.tagName
      this.namespaceURI = item.namespaceURI
      this.nodeType = item.nodeType
      this.attributes = item.attributes
      this.children = item.children
      this.overrideOuterHTML = item.overrideOuterHTML
    } else {
      this.overrideOuterHTML = String(item)
    }
  }
  remove() {
    this.isRemoved = 1
  }
  toString() {
    return this.outerHTML
  }
}

const prerenderDocument = {
  nodeType: 1,
  createElement: (tagName) => new PrerenderElement(null, tagName),
  createElementNS: (ns, tagName) => new PrerenderElement(ns, tagName),
};

const DEFAULT_OPTS = {
  html: 0,
  skipSetTimeout: 1,
};
const prerender = (f, opts = {}) => {
  opts = { ...DEFAULT_OPTS, ...opts }
  const originDocument = globalThis.document
  const originText = globalThis.Text
  const originSetTimeout = globalThis.setTimeout

  globalThis.document = prerenderDocument
  globalThis.Text = String
  opts.skipSetTimeout && (globalThis.setTimeout = () => 0)

  try {
    const tmpDiv = prerenderDocument.createElement("div")
    van.add(tmpDiv, f())
    return `${opts.html ? "<!DOCTYPE html>" : ""}${tmpDiv.innerHTML}`
  } finally {
    globalThis.document = originDocument
    globalThis.Text = originText
    opts.skipSetTimeout && (globalThis.setTimeout = originSetTimeout)
  }
}

export {
  prerender
}
