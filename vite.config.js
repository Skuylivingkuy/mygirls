import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 👈 Gunakan yang ini, bawaan default Vite terbaru

export default defineConfig({
  plugins: [react()],
  base: './', // 👈 Ini penting agar path file saat dihosting menjadi relatif dan aman
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})