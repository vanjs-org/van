import van from "vanjs-core"
import { FloatingWindow } from "vanjs-ui"

const { button, p } = van.tags

const example5 = () => {
    const closed = van.state(false)
    const x = van.state(300)
    const y = van.state(300)
    const width = van.state(300)
    const height = van.state(100)
    const zIndex = van.state(1000)  

    van.add(document.body, FloatingWindow({
        closed,
        x,
        y,
        width,
        height,
        title : "",
        closeCross: true,
        childrenContainerStyleOverrides: {
            display: "flex",
            "justify-content": "space-between",  
        },
        zIndex: zIndex
    },
        button({ onclick: () => zIndex.val++ }, "+"),
        p("z-index : ", zIndex),
        button({ onclick: () => zIndex.val-- }, "-"),
    ))
}

export default example5;
