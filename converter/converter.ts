import parse from "html-dom-parser"
import { ChildNode, Element, Text } from "domhandler"
import { marked } from 'marked'
import { RendererObject } from "MarkedOptions"

const dummy = "DUMMY"

const quoteIfNeeded = (key: string) => /^[a-zA-Z_][a-zA-Z_0-9]+$/.test(key) ? key : `"${key}"`

type Dom = Element | Text

const filterDoms = (doms: readonly ChildNode[], skipEmptyText: boolean) =>
  <Dom[]>doms.filter(
    c => c.type === "tag" && c.name !== dummy ||
    c.type === "text" && (!skipEmptyText || /\S/.test(c.data)))

export interface HtmlToVanCodeOptions {
  indent?: number
  spacing?: boolean
  skipEmptyText?: boolean
  htmlTagPred?: (name: string) => boolean
}

export const htmlToVanCode = (html: string, {
  indent = 2,
  spacing = false,
  skipEmptyText = false,
  htmlTagPred = s => s.toLowerCase() === s,
}: HtmlToVanCodeOptions = {}) => {
  const attrsToVanCode = (attrs: Record<string, string>, children: readonly Dom[]) => {
    const space = spacing ? " " : ""
    return Object.keys(attrs).length === 0 ? "" :
      `{${space}${Object.entries(attrs)
        .flatMap(([k, v]) => k !== dummy ? `${quoteIfNeeded(k)}: ${JSON.stringify(v)}` : [])
        .join(", ")}${space}}${children.length > 0 ? "," : ""}`
  }

  const domsToVanCode = (
    doms: readonly Dom[], prefix: string, skipEmptyText: boolean, tagsUsed: Set<string>,
  ) => doms.flatMap((dom): string | string[] => {
    const suffix = !prefix && doms.length <= 1 ? "" : ","
    if (dom.type === "text") return `${prefix}${JSON.stringify(dom.data)}${suffix}`
    tagsUsed.add(dom.name)
    const localSkipEmptyText = skipEmptyText && dom.name !== "pre"

    const children = filterDoms(dom.children, localSkipEmptyText)
    return dom.children.length > 0 ? [
      `${prefix}${dom.name}(${attrsToVanCode(dom.attribs, children)}`,
      ...domsToVanCode(children, prefix + " ".repeat(indent), localSkipEmptyText, tagsUsed),
      `${prefix})${suffix}`,
    ] : `${prefix}${dom.name}(${attrsToVanCode(dom.attribs, children)})${suffix}`
  })

  const doms = parse(html, <any>{lowerCaseTags: false, lowerCaseAttributeNames: false})
  const tagsUsed = new Set<string>
  const code = domsToVanCode(filterDoms(doms, skipEmptyText), "", skipEmptyText, tagsUsed)
  const tags: string[] = [], components: string[] = []
  for (const tag of tagsUsed) (htmlTagPred(tag) ? tags : components).push(tag)
  return {code, tags: tags.sort(), components: components.sort()}
}

interface MdToVanCodeOptions {
  indent?: number
  spacing?: boolean
  htmlTagPred?: (name: string) => boolean
  renderer?: RendererObject
}

export const mdToVanCode = (md: string, {
  indent = 2,
  spacing = false,
  htmlTagPred = s => s.toLowerCase() === s,
  renderer,
}: MdToVanCodeOptions = {}) =>
  htmlToVanCode(marked.use({renderer}).parse(md), {indent, spacing, skipEmptyText: true, htmlTagPred})
