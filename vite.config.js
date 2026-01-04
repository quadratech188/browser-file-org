import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        css: 'injected'
      }
    })
  ],
  build: {
    outDir: 'extension/dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'extension/svelte/exports.js'),
      name: 'SvelteUI',
      formats: ['iife'],
      fileName: 'exports'
    }
  }
});
