import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env': {},
    global: 'window',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts : ['.ahaodev.com', 'localhost'],
    proxy: {
      '/api/s3': {
        target: 'https://s3c.ahaodev.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/s3/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Host', 's3c.ahaodev.com');
          });
        },
      },
    },
  },
});
