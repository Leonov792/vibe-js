import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('./src/full.ts', import.meta.url));

export default defineConfig({
  root: 'examples/thermostat',
  resolve: {
    alias: {
      'vibe-js': src
    }
  }
});
