const lines = Deno.readTextFileSync("dist/van-graph.js").split("\n")

const result = lines.slice(2).flatMap(line =>
  !line || line.startsWith("import ") ? [] :
  line.startsWith("export ") ?
    "window.vanGraph = " + line.slice("export ".length) :
    line
)

Deno.writeTextFileSync("dist/van-graph.nomodule.js", `{
${result.map(l => "  " + l).join("\n")}
}`)
