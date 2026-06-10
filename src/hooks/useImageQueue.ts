import { useCallback, useState } from 'react'
import type { QueueItem } from '../types'

function bitmapToImageData(bmp: ImageBitmap): ImageData {
  const c = new OffscreenCanvas(bmp.width, bmp.height)
  const ctx = c.getContext('2d')!
  ctx.drawImage(bmp, 0, 0)
  return ctx.getImageData(0, 0, bmp.width, bmp.height)
}

export function useImageQueue() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const addFiles = useCallback(async (files: File[]) => {
    const created: QueueItem[] = []
    for (const file of files) {
      let bmp: ImageBitmap
      try { bmp = await createImageBitmap(file) } catch { continue }
      created.push({
        id: crypto.randomUUID(),
        fileName: file.name,
        width: bmp.width,
        height: bmp.height,
        original: bitmapToImageData(bmp),
        result: null,
        status: 'queued',
      })
      bmp.close?.()
    }
    setItems((prev) => [...prev, ...created])
    setActiveId((cur) => cur ?? created[0]?.id ?? null)
    return created
  }, [])

  const patch = useCallback((id: string, fn: (it: QueueItem) => QueueItem) => {
    setItems((prev) => prev.map((it) => (it.id === id ? fn(it) : it)))
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id)
      return next
    })
    setActiveId((cur) => {
      if (cur !== id) return cur
      // pick another item: prefer next sibling, fall back to previous
      const idx = items.findIndex((it) => it.id === id)
      const remaining = items.filter((it) => it.id !== id)
      return remaining[idx]?.id ?? remaining[idx - 1]?.id ?? remaining[0]?.id ?? null
    })
  }, [items])

  const clear = useCallback(() => { setItems([]); setActiveId(null) }, [])

  return { items, activeId, setActiveId, addFiles, patch, remove, clear }
}
