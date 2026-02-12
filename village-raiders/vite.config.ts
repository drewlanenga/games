import { defineConfig } from 'vite';

export default defineConfig({
  base: '/games/village-raiders/',
  server: {
    port: 8080,
  },
  build: {
    minify: 'terser',
    target: 'es2020',
  },
});
