import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tm': {
        target: 'https://app.ticketmaster.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tm/, '')
      }
    }
  }
});
