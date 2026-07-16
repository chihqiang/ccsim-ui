import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import pkg from './package.json'

export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.json' }),
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
    __SDK_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CcsimUI',
      formats: ['umd', 'es'],
      fileName: (format) => `ccsim-ui.${format}.js`,
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'esbuild',
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
  server: {
    port: 3000,
    open: '/examples/index.html',
  },
})
