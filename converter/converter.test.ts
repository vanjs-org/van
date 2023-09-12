import test from "ava"
import { htmlToVanCode } from "./converter.js"

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

test("htmlToVanCode: dummy tag", t => t.deepEqual(
  htmlToVanCode('<p>Hello<dummy></dummy>World!</p>'),
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

test("htmlToVanCode: dummy props", t => t.deepEqual(
  htmlToVanCode('<div dummy><a dummy></a></div>'),
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
  htmlToVanCode('<div><Symbol>Hello</Symbol><Link>🍦VanJS<dummy></dummy>https://vanjs.org/</Link></div>'),
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
