import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cross-origin isolation so onnxruntime-web can use multi-threaded WASM (SharedArrayBuffer).
// COEP 'credentialless' (not 'require-corp') so the cross-origin model fetch still works.
// Mirrors the headers set in vercel.json for production.
const crossOriginIsolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}

// https://vite.dev/config/
export default defineConfig({
  // Served from doetra.com/image-upscaler (Cloudflare Worker → this Vercel app).
  base: '/image-upscaler/',
  build: { outDir: 'dist/image-upscaler', emptyOutDir: true },
  // the server build (pre-rendering) bundles CommonJS-only packages instead of importing them
  ssr: { noExternal: ['file-saver'] },
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { headers: crossOriginIsolation },
  preview: { headers: crossOriginIsolation },
})
