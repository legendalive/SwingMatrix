import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' makes all built asset paths relative.
// That is what allows the app to load correctly from a
// GitHub Pages subpath such as /SwingMatrix/.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
