import { useCallback, useEffect, useRef, useState } from 'react'
import type { Device, WorkerResponse } from '../types'

interface DownloadProgress { loaded: number; total: number }

export function useUpscaler() {
  const workerRef = useRef<Worker | null>(null)
  const [ready, setReady] = useState(false)
  const [device, setDevice] = useState<Device>('wasm')
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  // pending upscale requests, keyed by id
  const pending = useRef<Map<string, {
    resolve: (img: ImageData) => void
    reject: (e: Error) => void
    onTile?: (done: number, total: number) => void
  }>>(new Map())

  useEffect(() => {
    const worker = new Worker(new URL('../worker/upscaleWorker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data
      if (msg.type === 'ready') { setReady(true); setDevice(msg.device); setProgress(null) }
      else if (msg.type === 'progress') setProgress({ loaded: msg.loaded, total: msg.total })
      else if (msg.type === 'tile') pending.current.get(msg.id)?.onTile?.(msg.tilesDone, msg.tilesTotal)
      else if (msg.type === 'result') { pending.current.get(msg.id)?.resolve(msg.image); pending.current.delete(msg.id) }
      else if (msg.type === 'error') {
        if (msg.id) { pending.current.get(msg.id)?.reject(new Error(msg.message)); pending.current.delete(msg.id) }
        else { setError(msg.message); setProgress(null) }
      }
    }
    worker.postMessage({ type: 'init' })
    return () => worker.terminate()
  }, [])

  const upscale = useCallback((id: string, image: ImageData, tile: number, overlap: number, onTile?: (d: number, t: number) => void) => {
    return new Promise<ImageData>((resolve, reject) => {
      pending.current.set(id, { resolve, reject, onTile })
      workerRef.current!.postMessage({ type: 'upscale', id, image, tile, overlap })
    })
  }, [])

  return { ready, device, progress, error, upscale }
}
