import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

import typescript from '@rollup/plugin-typescript'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      safelist: '',
    }),
    typescript({
        tsconfig: './tsconfig.json'
    }),
    vue()
  ]
})

