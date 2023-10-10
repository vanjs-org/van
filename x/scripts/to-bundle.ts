const lines = Deno.readTextFileSync("src/van-x.js").split("\n")

const result = lines.slice(2).flatMap(line =>
  !line || line.startsWith("import ") ? [] :
  line.startsWith("export let ") ?
    "window.vanX." + line.slice("export let ".length) :
    line
)

Deno.writeTextFileSync("dist/van-x.nomodule.js",
  `{
${["window.vanX = {}"].concat(result).map(l => "  " + l).join("\n")}
}`)

Deno.writeTextFileSync("test/van-x.test.nomodule.js",
  Deno.readTextFileSync("test/van-x.test.js").split("\n").slice(1).join("\n"))
