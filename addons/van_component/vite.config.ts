import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/van-component.ts",
      name: "vanC",
      fileName: (format, entryName) =>
        format == "umd" ? `${entryName}.nomodule.js` : `${entryName}.js`,
    },
    rollupOptions: {
      external: ["vanjs-core"],
      output: {
        globals: {
          "vanjs-core": "van",
        },
      },
    },
  },
});
