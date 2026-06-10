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

export type WorkerRequest =
  | { type: 'init' }
  | { type: 'upscale'; id: string; image: ImageData; tile: number; overlap: number }

export type WorkerResponse =
  | { type: 'ready'; device: Device }
  | { type: 'progress'; loaded: number; total: number }                 // model download
  | { type: 'tile'; id: string; tilesDone: number; tilesTotal: number } // inference progress
  | { type: 'result'; id: string; image: ImageData }                    // native ×4 output
  | { type: 'error'; id?: string; message: string }
