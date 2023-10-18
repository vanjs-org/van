const lines = Deno.readTextFileSync("src/van-x.js").split("\n")

const result = lines.slice(2).flatMap(line =>
  !line || line.startsWith("import ") ? [] :
  line.startsWith("export ") ?
    "window.vanX = " + line.slice("export ".length) :
    line
)

Deno.writeTextFileSync("dist/van-x.nomodule.js",
  `{
${result.map(l => "  " + l).join("\n")}
}`)

Deno.writeTextFileSync("test/van-x.test.nomodule.js",
  Deno.readTextFileSync("test/van-x.test.js").split("\n")
    .filter(l => !l.startsWith("export ")).join("\n")
)
