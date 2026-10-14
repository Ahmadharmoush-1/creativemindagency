import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Libraries change far less often than the site: keep them in their own long-cached files.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['gsap', 'gsap/ScrollTrigger', 'gsap/MotionPathPlugin', 'lenis'],
        },
      },
    },
  },
})
