import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base: works on GitHub Pages for any repo name (user.github.io/REPO/)
// and local dev at http://localhost:5173/ — pair with HashRouter in App.tsx
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
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