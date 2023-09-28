const lines = Deno.readTextFileSync("dist/van-ui.js").split("\n")

const result = lines.flatMap(line => {
  if (!line || line.startsWith("import ")) return []
  if (line.startsWith("export const ")) return "window." + line.slice("export const ".length)
  if (line.startsWith("export class ")) {
    const [_1, _2, name] = line.split(" ")
    return `window.${name} = class {`
  }
  return line
})

Deno.writeTextFileSync("dist/van-ui.nomodule.js",
  `{
${result.map(l => "  " + l).join("\n")}
}`)
