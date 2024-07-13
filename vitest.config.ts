// vitest.config.ts
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Ensure the same alias setup as in vite.config.ts
    },
  },
  test: {
    include: ['test/unit/**/*.{test,spec}.ts'], // Only include unit tests
    globals: true, // Allow global functions like describe, it, etc.
    environment: 'node', // Use 'node' environment for pure unit tests without DOM
  },
});
