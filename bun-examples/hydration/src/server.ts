import van from "mini-van-plate/van-plate"
import Hello from "./components/hello.js"
import Counter from "./components/counter.js"

const {body, div, h1, h2, head, link, meta, option, p, script, select, title} = van.tags

const server = Bun.serve({
  port: Bun.argv[2] ?? 8080,
  fetch(req) {
    const url = new URL(req.url)
    if (url.pathname.endsWith(".js")) return new Response(Bun.file("." + url.pathname))
    const counterInit = Number(url.searchParams.get("counter-init"))
    return new Response(van.html(
      head(
        link({rel: "icon", href: "logo.svg"}),
        title("SSR and Hydration Example"),
        meta({name: "viewport", content: "width=device-width, initial-scale=1"}),
      ),
      body(
        script({type: "text/javascript", src: `dist/client.js`, defer: true}),
        h1("Hello Components"),
        div({id: "hello-container"},
          Hello({van}),
        ),
        h1("Counter Components"),
        div({id: "counter-container"},
          h2("Basic Counter"),
          Counter({van, id: "basic-counter", init: counterInit}),
          h2("Styled Counter"),
          p("Select the button style: ",
            select({id: "button-style", value: "👆👇"},
              option("👆👇"),
              option("👍👎"),
              option("🔼🔽"),
              option("⏫⏬"),
              option("📈📉"),
            ),
          ),
          Counter({van, id: "styled-counter", init: counterInit, buttonStyle: "👆👇"}),
        ),
      )
    ), {headers: {"Content-Type": "text/html; charset=UTF-8"}})
  }
})
console.log(`Try visiting the server via http://localhost:${server.port}.
Also try http://localhost:${server.port}?counter-init=5 to set the initial value of the counters.`)
