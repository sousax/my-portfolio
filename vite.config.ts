import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the project at https://sousax.github.io/my-portfolio/
  base: '/my-portfolio/',
})
