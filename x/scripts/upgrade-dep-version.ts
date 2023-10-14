const [file,  dep, version] = Deno.args

const packageJson = JSON.parse(Deno.readTextFileSync(file))

for (const name in packageJson.dependencies)
  if (name === dep) packageJson.dependencies[name] = "^" + version

Deno.writeTextFileSync(file, JSON.stringify(packageJson, null, 2) + "\n")
