import van from "vanjs-core"
import { FloatingWindow } from "vanjs-ui"

const { div, p } = van.tags

const example2 = () => {
    const closed = van.state(false)
    const x = van.state(150)
    const y = van.state(150)
    const width = van.state(300)
    const height = van.state(200)

    van.add(document.body, FloatingWindow({
        title: "Example Window 2",
        closed,
        x,
        y,
        width,
        height,
        closeCross: true,
        headerStyleOverrides: {
            "background-color": "lightblue",
        }
    },
        div({ style: "display: flex; justify-content: center;" },
            p("This is another floating window!"),
        )
    ))
}

export default example2;