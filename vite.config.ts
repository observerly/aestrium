/// <reference types="vitest" />
import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

import typescript from '@rollup/plugin-typescript'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8099
  },
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
    alias: [
      {
        find: /^@\/(.+)/,
        replacement: path.resolve(__dirname, 'src') + '/$1'
      }
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 20000
  }
})
