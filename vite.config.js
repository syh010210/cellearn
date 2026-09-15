import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 5173 고정. 이미 쓰이고 있으면 다른 포트로 넘어가지 않고 오류로 멈춘다.
  server: { port: 5173, strictPort: true },
})
