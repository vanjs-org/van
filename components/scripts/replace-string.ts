const [file, oldStr, newStr] = Deno.args

console.log({file, oldStr, newStr})

Deno.writeTextFileSync(file, Deno.readTextFileSync(file).replace(oldStr, newStr))
