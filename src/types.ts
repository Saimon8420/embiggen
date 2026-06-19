export type Device = 'webgpu' | 'wasm'

// A target expressed as a desired LONG-SIDE in pixels (aspect ratio preserved).
// Note: the spec mentioned "custom W×H"; we use long-side px to avoid distortion.
export type ScaleSetting =
  | { kind: '2x' }
  | { kind: '4x' }
  | { kind: 'target'; longSide: number }

export type Status = 'queued' | 'processing' | 'done' | 'error'

export interface QueueItem {
  id: string
  fileName: string
  width: number
  height: number
  original: ImageData
  result: ImageData | null   // final, at the requested scale/target
  status: Status
  error?: string
  tilesDone?: number
  tilesTotal?: number
}

export type ExportFormat = 'png' | 'jpeg' | 'webp'

// What the main thread receives for a finished upscale: a small, capped display
// bitmap (for the before/after view) plus the FULL result dimensions. The
// full-resolution pixels are deliberately kept inside the worker — the main
// thread never holds them — so repeated large ×4 results can't pile up on the
// renderer heap (the cause of the cumulative "Out of Memory" crash).
export interface UpscaleResult { bitmap: ImageBitmap; width: number; height: number }

export type WorkerRequest =
  | { type: 'init' }
  // finalW/finalH: the worker resamples its ×4 output to this size (off the main
  // thread) so the main thread never touches the huge full-res buffer.
  | { type: 'upscale'; id: string; image: ImageData; tile: number; overlap: number; finalW: number; finalH: number }
  // Encode the worker-retained full-res result to a Blob of the given format.
  | { type: 'export'; id: string; format: ExportFormat }
  // Drop the retained full-res result (on New image) to free worker memory.
  | { type: 'release' }

export type WorkerResponse =
  | { type: 'ready'; device: Device }
  | { type: 'progress'; loaded: number; total: number }                 // model download
  | { type: 'tile'; id: string; tilesDone: number; tilesTotal: number } // inference progress
  // A capped display bitmap (transferable); full pixels stay in the worker.
  | { type: 'result'; id: string; bitmap: ImageBitmap; width: number; height: number }
  // The full-res result encoded to a Blob, ready to download.
  | { type: 'exported'; id: string; blob: Blob }
  | { type: 'error'; id?: string; message: string }
