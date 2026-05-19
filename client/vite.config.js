import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ include: /\.(mdx|js|jsx|ts|tsx)$/ })],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/verify-session': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/userinfo': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/upload': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/reviews': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/homepage': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/course': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/referal': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/purchase': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/adminDashboard': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/mcq': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/report': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/series': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/tests': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/enrollments': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/payments': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/series-mcqs': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/course-structure': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Create a separate chunk for each npm package
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase the chunk size limit to 1000 kB
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
