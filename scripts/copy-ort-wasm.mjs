// Copies onnxruntime-web's WASM engine artifacts into public/ort/ so they are
// served from our OWN origin instead of a third-party CDN (jsdelivr). This:
//   - removes a cross-origin dependency that ad-blockers / networks often break
//     (the classic "Failed to fetch dynamically imported module" at load time),
//   - keeps the engine version always in sync with the installed package,
//   - makes the app genuinely self-contained / private.
// Runs automatically via the `predev` and `prebuild` npm scripts. The output
// dir (public/ort) is gitignored — it is regenerated from node_modules.
import { mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'node_modules', 'onnxruntime-web', 'dist')
const outDir = join(root, 'public', 'ort')

if (!existsSync(srcDir)) {
  console.error('[copy-ort-wasm] onnxruntime-web/dist not found — run npm install first.')
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })

// Copy every WASM backend variant (.wasm) and its JS glue (.mjs). The browser
// only fetches the one it needs; copying all keeps WebGPU + WASM fallback working.
const wanted = readdirSync(srcDir).filter(
  (f) => f.startsWith('ort-wasm-simd-threaded.') && (f.endsWith('.wasm') || f.endsWith('.mjs'))
)

let n = 0
for (const f of wanted) {
  copyFileSync(join(srcDir, f), join(outDir, f))
  n++
}
console.log(`[copy-ort-wasm] copied ${n} engine file(s) to public/ort/`)
