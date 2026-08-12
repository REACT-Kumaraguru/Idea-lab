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
    },
  },
})
