import { useCallback, useEffect, useRef, useState } from 'react'
import type { Device, ExportFormat, UpscaleResult, WorkerResponse } from '../types'

interface DownloadProgress { loaded: number; total: number }

export function useUpscaler() {
  const workerRef = useRef<Worker | null>(null)
  const [ready, setReady] = useState(false)
  const [device, setDevice] = useState<Device>('wasm')
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  // pending upscale requests, keyed by id
  const pending = useRef<Map<string, {
    resolve: (r: UpscaleResult) => void
    reject: (e: Error) => void
    onTile?: (done: number, total: number) => void
  }>>(new Map())
  // pending export requests, keyed by id
  const exportPending = useRef<Map<string, { resolve: (b: Blob) => void; reject: (e: Error) => void }>>(new Map())
  const exportSeq = useRef(0)

  useEffect(() => {
    const worker = new Worker(new URL('../worker/upscaleWorker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data
      if (msg.type === 'ready') { setReady(true); setDevice(msg.device); setProgress(null) }
      else if (msg.type === 'progress') setProgress({ loaded: msg.loaded, total: msg.total })
      else if (msg.type === 'tile') pending.current.get(msg.id)?.onTile?.(msg.tilesDone, msg.tilesTotal)
      else if (msg.type === 'result') {
        pending.current.get(msg.id)?.resolve({ bitmap: msg.bitmap, width: msg.width, height: msg.height })
        pending.current.delete(msg.id)
      }
      else if (msg.type === 'exported') {
        exportPending.current.get(msg.id)?.resolve(msg.blob)
        exportPending.current.delete(msg.id)
      }
      else if (msg.type === 'error') {
        if (msg.id && pending.current.has(msg.id)) {
          pending.current.get(msg.id)!.reject(new Error(msg.message)); pending.current.delete(msg.id)
        } else if (msg.id && exportPending.current.has(msg.id)) {
          exportPending.current.get(msg.id)!.reject(new Error(msg.message)); exportPending.current.delete(msg.id)
        } else { setError(msg.message); setProgress(null) }
      }
    }
    worker.postMessage({ type: 'init' })
    return () => worker.terminate()
  }, [])

  const upscale = useCallback((id: string, image: ImageData, tile: number, overlap: number, finalW: number, finalH: number, onTile?: (d: number, t: number) => void) => {
    return new Promise<UpscaleResult>((resolve, reject) => {
      pending.current.set(id, { resolve, reject, onTile })
      workerRef.current!.postMessage({ type: 'upscale', id, image, tile, overlap, finalW, finalH })
    })
  }, [])

  // Ask the worker to encode its retained full-res result to a Blob.
  const exportResult = useCallback((format: ExportFormat) => {
    return new Promise<Blob>((resolve, reject) => {
      const id = `export-${++exportSeq.current}`
      exportPending.current.set(id, { resolve, reject })
      workerRef.current!.postMessage({ type: 'export', id, format })
    })
  }, [])

  // Free the worker's retained full-res result (e.g. on New image).
  const release = useCallback(() => {
    workerRef.current?.postMessage({ type: 'release' })
  }, [])

  return { ready, device, progress, error, upscale, exportResult, release }
}
