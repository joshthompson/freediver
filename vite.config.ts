import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import path from 'path'

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@style': path.resolve(__dirname, 'styled-system'),
      '@public': path.resolve(__dirname, 'public'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  base: '/freediver/',
});
