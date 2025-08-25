import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
<<<<<<< HEAD
  base: 'resturant',
  server: {
    host: "0.0.0.0"
  }
=======
>>>>>>> parent of e576f00 (add gh-pages)
})
