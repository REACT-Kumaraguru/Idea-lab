import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5205,
    strictPort: false,
    watch: {
      ignored: ['**/tests/**', '**/.git/**', '**/dist/**']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5003',
        changeOrigin: false,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map((cookie) =>
                cookie.replace(/;\s*Domain=[^;]+/gi, '').replace(/;\s*Secure/gi, '')
              );
            }
          });
        },
      },
      '/src/uploads': {
        target: 'http://localhost:5003',
        changeOrigin: false,
      },
      '/uploads': {
        target: 'http://localhost:5003',
        changeOrigin: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // PDF engines (heavy)
            if (id.includes('@react-pdf') || id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf';
            }
            // Icons (must check before generic react)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Animations & Motion
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // QR Code generation & camera scanner
            if (id.includes('html5-qrcode') || id.includes('qrcode.react')) {
              return 'vendor-qr';
            }
            // Core React runtime ONLY
            if (
              id.includes('/react/') ||
              id.includes('\\react\\') ||
              id.includes('/react-dom/') ||
              id.includes('\\react-dom\\') ||
              id.includes('/react-router/') ||
              id.includes('\\react-router\\') ||
              id.includes('/react-router-dom/') ||
              id.includes('\\react-router-dom\\') ||
              id.includes('/scheduler/') ||
              id.includes('\\scheduler\\')
            ) {
              return 'vendor-react';
            }
            // Excel & spreadsheet utilities
            if (id.includes('xlsx') || id.includes('exceljs')) {
              return 'vendor-excel';
            }
          }
        },
      },
    },
  },
})
