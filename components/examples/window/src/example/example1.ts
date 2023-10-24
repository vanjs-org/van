import van from "vanjs-core"
import { FloatingWindow } from "vanjs-ui"

const { button, div, p } = van.tags

const example1 = () => {
    const closed = van.state(false)
    const x = van.state(100)
    const y = van.state(100)
    const width = van.state(300)
    const height = van.state(200)

    van.add(document.body, FloatingWindow({
        title: "Example Window 1",
        closed,
        x,
        y,
        width,
        height
    },
        div({ style: "padding: 1rem;" },
            p("Hello, World!"),
            div({ style: "display: flex; justify-content: center;" },
                button({ onclick: () => closed.val = true }, "Close Window"),
            ),
        )
    ))
}

export default example1;