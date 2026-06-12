// Draw an ImageData onto a canvas via createImageBitmap (decodes off the main
// thread) instead of putImageData (which blocks the main thread on big buffers).
// The bitmap is downscaled to a capped display size so a huge ×4 result never
// becomes a giant on-screen canvas — the full-res ImageData is kept only for export.
const MAX_DISPLAY = 1600

export async function drawCapped(
  canvas: HTMLCanvasElement,
  img: ImageData | ImageBitmap,
  dispW?: number,
  dispH?: number,
) {
  let w = dispW
  let h = dispH
  if (w === undefined || h === undefined) {
    const s = Math.min(1, MAX_DISPLAY / Math.max(img.width, img.height))
    w = Math.max(1, Math.round(img.width * s))
    h = Math.max(1, Math.round(img.height * s))
  }
  const bmp = await createImageBitmap(img, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' })
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(bmp, 0, 0)
  bmp.close()
}

// Capped display dimensions for an image (preserves aspect ratio).
export function cappedSize(w: number, h: number): { w: number; h: number } {
  const s = Math.min(1, MAX_DISPLAY / Math.max(w, h))
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) }
}
