const bindStr = nums =>
  `declare function bind<${nums.map(n => "T" + n).join(", ")}>(${nums.map(n => `d${n}: StateView<T${n}>, `).join("")}f: (${nums.map(n => `v${n}: T${n}, `).join("")}dom: Element${nums.map(n => `, oldV${n}: T${n}`).join("")}) => Primitive | Node | null | undefined): Node | []`

for (let i = 1; i <= 10; ++i) console.log(bindStr(Array.from({length: i}).map((_, i) => i + 1)))
