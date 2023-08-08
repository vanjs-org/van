import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: "terser",
    terserOptions: {
      module: true,
      toplevel: true,
      compress: {
        passes: 1,
      },
      mangle: {
        properties: {
          regex: /^_.+/,
        },
      },
      format: {
        wrap_func_args: false,
      },
    },
  },
})
