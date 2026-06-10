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
  // finalW/finalH: the worker resamples its ×4 output to this size (off the main
  // thread) so the main thread never touches the huge full-res buffer.
  | { type: 'upscale'; id: string; image: ImageData; tile: number; overlap: number; finalW: number; finalH: number }

export type WorkerResponse =
  | { type: 'ready'; device: Device }
  | { type: 'progress'; loaded: number; total: number }                 // model download
  | { type: 'tile'; id: string; tilesDone: number; tilesTotal: number } // inference progress
  // result is sent as a transferable ArrayBuffer (no structured-clone copy)
  | { type: 'result'; id: string; buffer: ArrayBuffer; width: number; height: number }
  | { type: 'error'; id?: string; message: string }
