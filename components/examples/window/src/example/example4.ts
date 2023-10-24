import van from "vanjs-core"
import { FloatingWindow } from "vanjs-ui"


const { button } = van.tags

const example4 = () => {
    const closed = van.state(false)
    const x = van.state(300)
    const y = van.state(300)
    const width = van.state(500)
    const height = van.state(300)

    van.add(document.body, FloatingWindow({
        closed,
        x,
        y,
        width,
        height,
        closeCross: true,
        windowStyleOverrides: {
            "background-color": "lightgray",
            padding: "0px",
            border: "1px solid red",
        },
        childrenContainerStyleOverrides: {
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: "100%",
        }
    },
        button({ onclick: () => closed.val = true }, "Close Window"),
    ))
}

export default example4;