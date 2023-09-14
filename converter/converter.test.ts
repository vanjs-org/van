import test from "ava"
import { htmlToVanCode, mdToVanCode } from "./converter.js"

test("htmlToVanCode: Hello", t => t.deepEqual(
  htmlToVanCode('<div><p>👋Hello</p><ul><li>🗺️World</li><li><a href="https://vanjs.org/">🍦VanJS</a></li></ul></div>'),
  {
    code: [
      'div(',
      '  p(',
      '    "👋Hello",',
      '  ),',
      '  ul(',
      '    li(',
      '      "🗺️World",',
      '    ),',
      '    li(',
      '      a({href: "https://vanjs.org/"},',
      '        "🍦VanJS",',
      '      ),',
      '    ),',
      '  ),',
      ')',
    ],
    tags: ["a", "div", "li", "p", "ul"],
    components: [],
  },
))

test("htmlToVanCode: <input>", t => t.deepEqual(
  htmlToVanCode('<div><input type="text" name="name" value="value"></div>'),
  {
    code: [
      'div(',
      '  input({type: "text", name: "name", value: "value"}),',
      ')',
    ],
    tags: ["div", "input"],
    components: [],
  },
))

test("htmlToVanCode: DUMMY tag", t => t.deepEqual(
  htmlToVanCode('<p>Hello<DUMMY></DUMMY>World!</p>'),
  {
    code: [
      'p(',
      '  "Hello",',
      '  "World!",',
      ')',
    ],
    tags: ["p"],
    components: [],
  },
))

test("htmlToVanCode: DUMMY props", t => t.deepEqual(
  htmlToVanCode('<div DUMMY><a DUMMY></a></div>'),
  {
    code: [
      'div({},',
      '  a({}),',
      ')',
    ],
    tags: ["a", "div"],
    components: [],
  },
))

test("htmlToVanCode: custom indent", t => t.deepEqual(
  htmlToVanCode('<div><p>👋Hello</p><ul><li>🗺️World</li><li><a href="https://vanjs.org/">🍦VanJS</a></li></ul></div>', {indent: 4}),
  {
    code: [
      'div(',
      '    p(',
      '        "👋Hello",',
      '    ),',
      '    ul(',
      '        li(',
      '            "🗺️World",',
      '        ),',
      '        li(',
      '            a({href: "https://vanjs.org/"},',
      '                "🍦VanJS",',
      '            ),',
      '        ),',
      '    ),',
      ')',
    ],
    tags: ["a", "div", "li", "p", "ul"],
    components: [],
  },
))

test("htmlToVanCode: spacing", t => t.deepEqual(
  htmlToVanCode('<div><p>👋Hello</p><ul><li>🗺️World</li><li><a href="https://vanjs.org/">🍦VanJS</a></li></ul></div>', {spacing: true}),
  {
    code: [
      'div(',
      '  p(',
      '    "👋Hello",',
      '  ),',
      '  ul(',
      '    li(',
      '      "🗺️World",',
      '    ),',
      '    li(',
      '      a({ href: "https://vanjs.org/" },',
      '        "🍦VanJS",',
      '      ),',
      '    ),',
      '  ),',
      ')',
    ],
    tags: ["a", "div", "li", "p", "ul"],
    components: [],
  },
))

test("htmlToVanCode: skip empty text", t => t.deepEqual(
  htmlToVanCode(`<div>
  <p>👋Hello</p>
  <ul>
    <li>🗺️World</li>
    <li><a href="https://vanjs.org/">🍦VanJS</a></li>
  </ul>
</div>`, {skipEmptyText: true}),
  {
    code: [
      'div(',
      '  p(',
      '    "👋Hello",',
      '  ),',
      '  ul(',
      '    li(',
      '      "🗺️World",',
      '    ),',
      '    li(',
      '      a({href: "https://vanjs.org/"},',
      '        "🍦VanJS",',
      '      ),',
      '    ),',
      '  ),',
      ')',
    ],
    tags: ["a", "div", "li", "p", "ul"],
    components: [],
  },
))

test("htmlToVanCode: skip empty text - keep <pre>", t => t.deepEqual(
  htmlToVanCode(`<div>
  <h1>👋Hello</h1>
  <div>
    <span>Div content 1</span>
  </div>
  <pre>Pre content<code>++counter.val<span>;</span>
</code>
  </pre>
  <div>
    <span>Div content 2</span>
  </div>
  <div>
    Div content 3
  </div>
</div>`, {skipEmptyText: true}),
  {
    code: [
      'div(',
      '  h1(',
      '    "👋Hello",',
      '  ),',
      '  div(',
      '    span(',
      '      "Div content 1",',
      '    ),',
      '  ),',
      '  pre(',
      '    "Pre content",',
      '    code(',
      '      "++counter.val",',
      '      span(',
      '        ";",',
      '      ),',
      '      "\\n",',
      '    ),',
      '    "\\n  ",',
      '  ),',
      '  div(',
      '    span(',
      '      "Div content 2",',
      '    ),',
      '  ),',
      '  div(',
      '    "\\n    Div content 3\\n  ",',
      '  ),',
      ')',
    ],
    tags: ["code", "div", "h1", "pre", "span"],
    components: [],
  },
))

test("htmlToVanCode: not skip empty text", t => t.deepEqual(
  htmlToVanCode(`<div>
  <p>👋Hello</p>
  <ul>
    <li>🗺️World</li>
    <li><a href="https://vanjs.org/">🍦VanJS</a></li>
  </ul>
</div>`),
  {
    code: [
      'div(',
      '  "\\n  ",',
      '  p(',
      '    "👋Hello",',
      '  ),',
      '  "\\n  ",',
      '  ul(',
      '    "\\n    ",',
      '    li(',
      '      "🗺️World",',
      '    ),',
      '    "\\n    ",',
      '    li(',
      '      a({href: "https://vanjs.org/"},',
      '        "🍦VanJS",',
      '      ),',
      '    ),',
      '    "\\n  ",',
      '  ),',
      '  "\\n",',
      ')',
    ],
    tags: ["a", "div", "li", "p", "ul"],
    components: [],
  },
))

test("htmlToVanCode: custom components", t => t.deepEqual(
  htmlToVanCode('<div><Symbol>Hello</Symbol><Link>🍦VanJS<DUMMY></DUMMY>https://vanjs.org/</Link></div>'),
  {
    code: [
      'div(',
      '  Symbol(',
      '    "Hello",',
      '  ),',
      '  Link(',
      '    "🍦VanJS",',
      '    "https://vanjs.org/",',
      '  ),',
      ')',
    ],
    tags: ["div"],
    components: ["Link", "Symbol"],
  },
))

test("htmlToVanCode: multiple elements", t => t.deepEqual(
  htmlToVanCode('<div><p>👋Hello</p><ul><li>🗺️World</li><li><a href="https://vanjs.org/">🍦VanJS</a></li></ul></div><p>Second Paragraph</p>'),
  {
    code: [
      'div(',
      '  p(',
      '    "👋Hello",',
      '  ),',
      '  ul(',
      '    li(',
      '      "🗺️World",',
      '    ),',
      '    li(',
      '      a({href: "https://vanjs.org/"},',
      '        "🍦VanJS",',
      '      ),',
      '    ),',
      '  ),',
      '),',
      'p(',
      '  "Second Paragraph",',
      '),',
    ],
    tags: ["a", "div", "li", "p", "ul"],
    components: [],
  },
))

test("htmlToVanCode: nested divs", t => t.deepEqual(
  htmlToVanCode('<div><div>1</div><div>2</div></div><div><div>3</div><div>4</div></div>'),
  {
    code: [
      'div(',
      '  div(',
      '    "1",',
      '  ),',
      '  div(',
      '    "2",',
      '  ),',
      '),',
      'div(',
      '  div(',
      '    "3",',
      '  ),',
      '  div(',
      '    "4",',
      '  ),',
      '),',
    ],
    tags: ["div"],
    components: [],
  },
))

test("htmlToVanCode: nested spans", t => t.deepEqual(
  htmlToVanCode('<span><span>1</span><span>2</span></span><span><span>3</span><span>4</span></span>'),
  {
    code: [
      'span(',
      '  span(',
      '    "1",',
      '  ),',
      '  span(',
      '    "2",',
      '  ),',
      '),',
      'span(',
      '  span(',
      '    "3",',
      '  ),',
      '  span(',
      '    "4",',
      '  ),',
      '),',
    ],
    tags: ["span"],
    components: [],
  },
))

test("mdToVanCode: Hello", t => t.deepEqual(
  mdToVanCode(`👋Hello
* 🗺️World
* [🍦VanJS](https://vanjs.org/)
`),
  {
    code: [
      'p(',
      '  "👋Hello",',
      '),',
      'ul(',
      '  li(',
      '    "🗺️World",',
      '  ),',
      '  li(',
      '    a({href: "https://vanjs.org/"},',
      '      "🍦VanJS",',
      '    ),',
      '  ),',
      '),',
    ],
    tags: ["a", "li", "p", "ul"],
    components: [],
  },
))

test("mdToVanCode: custom indent", t => t.deepEqual(
  mdToVanCode(`👋Hello
* 🗺️World
* [🍦VanJS](https://vanjs.org/)
`, {indent: 4}),
  {
    code: [
      'p(',
      '    "👋Hello",',
      '),',
      'ul(',
      '    li(',
      '        "🗺️World",',
      '    ),',
      '    li(',
      '        a({href: "https://vanjs.org/"},',
      '            "🍦VanJS",',
      '        ),',
      '    ),',
      '),',
    ],
    tags: ["a", "li", "p", "ul"],
    components: [],
  },
))

test("mdToVanCode: spacing", t => t.deepEqual(
  mdToVanCode(`👋Hello
* 🗺️World
* [🍦VanJS](https://vanjs.org/)
`, {spacing: true}),
  {
    code: [
      'p(',
      '  "👋Hello",',
      '),',
      'ul(',
      '  li(',
      '    "🗺️World",',
      '  ),',
      '  li(',
      '    a({ href: "https://vanjs.org/" },',
      '      "🍦VanJS",',
      '    ),',
      '  ),',
      '),',
    ],
    tags: ["a", "li", "p", "ul"],
    components: [],
  },
))

test("mdToVanCode: typical content", t => t.deepEqual(
  mdToVanCode(`# Heading 1
## Heading 2

First paragraph

Second paragraph, with [link](https://example.com/) and \`symbol\` and some code blocks

\`\`\`js
const Hello = () => div(
  p("👋Hello"),
  ul(
    li("🗺️World"),
    li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
  ),
)
\`\`\`

<CustomElement>content 1</CustomElement>
<CustomElement DUMMY>content 2</CustomElement>
<Pair>first<DUMMY></DUMMY>second</Pair>
`),
  {
    code: [
      'h1(',
      '  "Heading 1",',
      '),',
      'h2(',
      '  "Heading 2",',
      '),',
      'p(',
      '  "First paragraph",',
      '),',
      'p(',
      '  "Second paragraph, with ",',
      '  a({href: "https://example.com/"},',
      '    "link",',
      '  ),',
      '  " and ",',
      '  code(',
      '    "symbol",',
      '  ),',
      '  " and some code blocks",',
      '),',
      'pre(',
      '  code({class: "language-js"},',
      '    "const Hello = () => div(\\n  p(\\"👋Hello\\"),\\n  ul(\\n    li(\\"🗺️World\\"),\\n    li(a({href: \\"https://vanjs.org/\\"}, \\"🍦VanJS\\")),\\n  ),\\n)\\n",',
      '  ),',
      '),',
      'p(',
      '  CustomElement(',
      '    "content 1",',
      '  ),',
      '  CustomElement({},',
      '    "content 2",',
      '  ),',
      '  Pair(',
      '    "first",',
      '    "second",',
      '  ),',
      '),',
    ],
    tags: ["a", "code", "h1", "h2", "p", "pre"],
    components: ["CustomElement", "Pair"],
  },
))

test("mdToVanCode: custom renderer", t => t.deepEqual(
  mdToVanCode(`# Heading 1
## Heading 2

First paragraph

Second paragraph, with [link](https://example.com/) and \`symbol\` and some code blocks

\`\`\`js
const Hello = () => div(
  p("👋Hello"),
  ul(
    li("🗺️World"),
    li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
  ),
)
\`\`\`

<CustomElement>content 1</CustomElement>
<CustomElement DUMMY>content 2</CustomElement>
<Pair>first<DUMMY></DUMMY>second</Pair>
`,
    {
      renderer: {
        codespan: s => `<Symbol>${s}</Symbol>`,
        link: (href, _unused_title, text) => `<Link>${text}<DUMMY></DUMMY>${href}</Link>`
      },
    },
  ),
  {
    code: [
      'h1(',
      '  "Heading 1",',
      '),',
      'h2(',
      '  "Heading 2",',
      '),',
      'p(',
      '  "First paragraph",',
      '),',
      'p(',
      '  "Second paragraph, with ",',
      '  Link(',
      '    "link",',
      '    "https://example.com/",',
      '  ),',
      '  " and ",',
      '  Symbol(',
      '    "symbol",',
      '  ),',
      '  " and some code blocks",',
      '),',
      'pre(',
      '  code({class: "language-js"},',
      '    "const Hello = () => div(\\n  p(\\"👋Hello\\"),\\n  ul(\\n    li(\\"🗺️World\\"),\\n    li(a({href: \\"https://vanjs.org/\\"}, \\"🍦VanJS\\")),\\n  ),\\n)\\n",',
      '  ),',
      '),',
      'p(',
      '  CustomElement(',
      '    "content 1",',
      '  ),',
      '  CustomElement({},',
      '    "content 2",',
      '  ),',
      '  Pair(',
      '    "first",',
      '    "second",',
      '  ),',
      '),',
    ],
    tags: ["code", "h1", "h2", "p", "pre"],
    components: ["CustomElement", "Link", "Pair", "Symbol"],
  },
))
