import van from "vanjs-core"
import { FloatingWindow, Tabs } from "vanjs-ui"

export type CSSPropertyBag = Record<string, string | number>

const toStyleStr = (style: CSSPropertyBag) =>
    Object.entries(style).map(([k, v]) => `${k}: ${v};`).join("")

const { div, p, a, b, code, pre, span, style } = van.tags

let windowId = 0;

const example3 = () => {
    const closed = van.state(false)
    const x = van.state(200)
    const y = van.state(200)
    const width = van.state(500)
    const height = van.state(300)

    const crossId = `custom-cross-${++windowId}`;

    document.head.appendChild(
        style({ type: "text/css" }, `
    #${crossId}:hover {${toStyleStr({
            "background-color": "red",
            color: "white",
        })}}
    `),
    );

    van.add(document.body, FloatingWindow({
        closed,
        x,
        y,
        width,
        height,
        windowStyleOverrides: {
            "background-color": "lightgray",
            padding: "0px",
        },
    },
        div(
            span({
                style: toStyleStr({
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    padding: "0 0.5rem",
                    height: "2.5rem",
                    display: "inline-flex",
                    "align-items": "center",
                    cursor: "pointer",
                }),
                id: crossId,
                onclick: () => closed.val = true,
            }, "×"),
            Tabs(
                {
                    style: toStyleStr({
                        width: "100%",
                    }),
                    tabButtonActiveColor: "white",
                    tabButtonBorderStyle: "none",
                    tabButtonRowColor: "lightblue",
                    tabButtonRowStyleOverrides: {
                        height: "2.5rem",
                    },
                    tabButtonStyleOverrides: {
                        height: "100%",
                    },
                },
                {
                    Home: p(
                        "Welcome to ", b("VanJS"), " - the smallest reactive UI framework in the world.",
                    ),
                    "Getting Started": [
                        p("To install the ", b("VanJS"), " NPM package, run the line below:"),
                        pre(code("npm install vanjs-core")),
                    ],
                    About: p(
                        "The author of ", b("VanJS"), " is ",
                        a({ href: "https://github.com/Tao-VanJS" }, " Tao Xin"), "."
                    ),
                },
            )
        )
    ))
}

export default example3;