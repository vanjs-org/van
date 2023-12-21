import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/van-component.js",
      name: "vanC",
      fileName: (format, entryName) =>
        `${entryName}${format == "umd" ? ".nomodule" : ""}.min.js`,
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
