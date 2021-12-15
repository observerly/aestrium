import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import typescript from '@rollup/plugin-typescript'

import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      ...typescript({
        tsconfig: './tsconfig.json'
      }),
      ...vue()
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '/src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'aestrium-vue',
      fileName: format => `aestrium-vue.${format}.js`
    },
    rollupOptions: {
      external: ['vue', '@observerly/celestia'],
      output: {
        sourcemap: false,
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})

