import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'Samotnik',
      fileName: 'samotnik.js',
      formats: ['es']
    },
    minify: 'terser',
    rollupOptions: {
    },
  },
});