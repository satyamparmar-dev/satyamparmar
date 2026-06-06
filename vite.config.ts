import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Root base for custom domain (https://satyamparmar.blog). HashRouter avoids SPA 404 issues.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          store: ['zustand'],
        },
      },
    },
  },
})