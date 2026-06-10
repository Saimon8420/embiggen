// Real-ESRGAN ×4 upscaler worker. Runs realesr-general-x4v3 over overlapping
// tiles so any image size fits in GPU memory; returns the assembled ×4 ImageData.
// Engine artifacts are served same-origin from /ort/ (copied by scripts/copy-ort-wasm.mjs).
// Each tile is padded to a CONSTANT input size (tile + 2*overlap) so the model
// sees a stable shape every run; the crop never reads the padded area.
//
// Execution: the PLAIN WASM build (not 'onnxruntime-web/webgpu'). The WebGPU
// build probes the GPU during init, which can hang in real browsers that have
// WebGPU, and the WebGPU EP also errors mid-run on this model's ops. The plain
// build avoids all that — proven correct in the model spike, and fast enough
// given the model is tiny (~5 MB). Multi-threading needs cross-origin isolation
// (COOP/COEP), set in vite.config.ts (dev/preview) and vercel.json (prod).
import * as ort from 'onnxruntime-web'
import { planTiles } from '../lib/tiling'
import type { Device, WorkerRequest, WorkerResponse } from '../types'

const MODEL_URL = 'https://huggingface.co/OwlMaster/AllFilesRope/resolve/main/realesr-general-x4v3.onnx'
const SCALE = 4
ort.env.wasm.wasmPaths = new URL('/ort/', self.location.origin).href

let session: ort.InferenceSession | null = null
const device: Device = 'wasm'

function post(msg: WorkerResponse) { ;(self as unknown as Worker).postMessage(msg) }

async function fetchModelWithProgress(url: string): Promise<ArrayBuffer> {
  let res: Response
  try { res = await fetch(url) }
  catch { throw new Error('Could not download the AI model — check your connection.') }
  if (!res.ok || !res.body) throw new Error('Could not download the AI model (server error).')
  const total = Number(res.headers.get('content-length')) || 0
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value); loaded += value.length
    post({ type: 'progress', loaded, total })
  }
  const out = new Uint8Array(loaded); let off = 0
  for (const c of chunks) { out.set(c, off); off += c.length }
  return out.buffer
}

async function init() {
  const buf = await fetchModelWithProgress(MODEL_URL)
  session = await ort.InferenceSession.create(buf, { executionProviders: ['wasm'] })
  post({ type: 'ready', device })
}

// A PAD×PAD RGBA buffer → planar CHW float32 [0,1] tensor of shape [1,3,PAD,PAD].
function toTensor(data: Uint8ClampedArray, pad: number): ort.Tensor {
  const n = pad * pad
  const f = new Float32Array(3 * n)
  for (let i = 0; i < n; i++) {
    f[i] = data[i * 4] / 255
    f[n + i] = data[i * 4 + 1] / 255
    f[2 * n + i] = data[i * 4 + 2] / 255
  }
  return new ort.Tensor('float32', f, [1, 3, pad, pad])
}

async function upscale(id: string, image: ImageData, tile: number, overlap: number, finalW: number, finalH: number) {
  if (!session) throw new Error('Model not ready')
  const srcW = image.width, srcH = image.height
  const src = new OffscreenCanvas(srcW, srcH)
  src.getContext('2d')!.putImageData(image, 0, 0)

  const outW = srcW * SCALE, outH = srcH * SCALE
  const out = new OffscreenCanvas(outW, outH)
  const octx = out.getContext('2d')!

  const pad = tile + 2 * overlap        // constant model input size (e.g. 288)
  const up = pad * SCALE                // constant model output size (e.g. 1152)
  const inCanvas = new OffscreenCanvas(pad, pad)
  const inctx = inCanvas.getContext('2d')!

  const tiles = planTiles(srcW, srcH, tile, overlap, SCALE)
  const inName = session.inputNames[0]
  const outName = session.outputNames[0]

  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i]
    // place the (≤pad) source extract at the top-left of a constant pad×pad canvas
    inctx.clearRect(0, 0, pad, pad)
    inctx.drawImage(src, t.sx, t.sy, t.sw, t.sh, 0, 0, t.sw, t.sh)
    const padded = inctx.getImageData(0, 0, pad, pad)

    const result = await session.run({ [inName]: toTensor(padded.data, pad) })
    const data = result[outName].data as Float32Array

    const n = up * up
    const rgba = new Uint8ClampedArray(n * 4)
    for (let p = 0; p < n; p++) {
      rgba[p * 4] = data[p] * 255
      rgba[p * 4 + 1] = data[n + p] * 255
      rgba[p * 4 + 2] = data[2 * n + p] * 255
      rgba[p * 4 + 3] = 255
    }
    const upCanvas = new OffscreenCanvas(up, up)
    upCanvas.getContext('2d')!.putImageData(new ImageData(rgba, up, up), 0, 0)
    // crop the core region out of the upscaled padded tile and place it (1:1, no scaling)
    octx.drawImage(upCanvas, t.cropX, t.cropY, t.dw, t.dh, t.dx, t.dy, t.dw, t.dh)

    post({ type: 'tile', id, tilesDone: i + 1, tilesTotal: tiles.length })
  }

  // Resample the ×4 output to the requested final size HERE (off the main thread).
  // For a plain 4× this is a no-op pass-through.
  let finalCanvas: OffscreenCanvas = out
  if (finalW !== outW || finalH !== outH) {
    finalCanvas = new OffscreenCanvas(finalW, finalH)
    const fctx = finalCanvas.getContext('2d')!
    fctx.imageSmoothingEnabled = true
    fctx.imageSmoothingQuality = 'high'
    fctx.drawImage(out, 0, 0, finalW, finalH)
  }
  const finalImage = finalCanvas.getContext('2d')!.getImageData(0, 0, finalW, finalH)
  const buf = finalImage.data.buffer
  // transfer the buffer so the main thread doesn't pay a structured-clone copy
  ;(self as unknown as Worker).postMessage({ type: 'result', id, buffer: buf, width: finalW, height: finalH }, [buf])
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  try {
    if (e.data.type === 'init') await init()
    else if (e.data.type === 'upscale') await upscale(e.data.id, e.data.image, e.data.tile, e.data.overlap, e.data.finalW, e.data.finalH)
  } catch (err) {
    const id = 'id' in e.data ? e.data.id : undefined
    post({ type: 'error', id, message: err instanceof Error ? err.message : 'Upscale failed' })
  }
}
