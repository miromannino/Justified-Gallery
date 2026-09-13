import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
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

// In dev, the server root is `test/browser` so that the test pages asset paths
// (e.g. `../imgs/...`) resolve naturally. That means a plain
// `<link href="...">` from a test page can't reach `src/style` with a
// relative path. This plugin rewrites requests for a
// stable `/style/justified-gallery.css` URL to Vite's `/@fs/` absolute-path
// form, so the test pages can link the real stylesheet (compiled live
// from `src/style/justified-gallery.scss`).
function serveLibraryStyleForDevTests() {
  const absoluteScssPath = path
    .resolve(__dirname, 'src/style/justified-gallery.scss')
    .replace(/\\/g, '/');
  return {
    name: 'serve-library-style-for-dev-tests',
    apply: 'serve' as const,
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith('/style/justified-gallery.css')) {
          req.url = req.url.replace(
            '/style/justified-gallery.css',
            `/@fs/${absoluteScssPath}`
          );
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vue(), serveLibraryStyleForDevTests()],
  root: isDev
    ? path.resolve(__dirname, 'test/browser')
    : path.resolve(__dirname, 'src'),
  publicDir: 'public',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/justified-gallery.ts'),
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
