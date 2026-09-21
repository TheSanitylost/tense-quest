import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 43123,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
