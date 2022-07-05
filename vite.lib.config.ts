import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

import typescript from '@rollup/plugin-typescript'

import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      safelist: ''
    }),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    vue()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '/src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@observerly/aestrium',
      fileName: format => `aestrium.${format}.js`
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue', '@observerly/polaris'],
      output: {
        sourcemap: true,
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          '@observerly/polaris': '@observerly/polaris'
        }
      }
    }
  }
})
