import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['cjs'],
      fileName: 'main'
    },
    rollupOptions: {
      external: ['obsidian'],
      output: {
        globals: {
          obsidian: 'obsidian'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});