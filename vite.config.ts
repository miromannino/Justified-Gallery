import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';

export const SERVER_CONFIG = {
  host: 'localhost',
  port: 3000,
};

// https://vitejs.dev/config/
export default defineConfig({
  root: isDev
    ? path.resolve(__dirname, 'test/browser')
    : path.resolve(__dirname, 'src'),
  publicDir: 'public',
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Output CSS separately
          if (assetInfo.name?.endsWith('.css')) return 'assets/[name].css';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    ...SERVER_CONFIG,
    open: true,
    fs: {
      allow: [
        // Allow Vite to serve files from both src and test folders
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'test'),
      ],
    },
  },
  optimizeDeps: {
    include: ['src/**/*'], // Include only the source files in the optimization
    exclude: ['test/**/*'], // Exclude all test files and directories
  },
});
