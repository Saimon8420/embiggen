// Resize an ImageData to w×h using high-quality canvas resampling. Returns the
// input unchanged when it already matches, so 4× native output passes through
// untouched and 2×/target output is downscaled cleanly from the 4× result.
export function resampleTo(img: ImageData, w: number, h: number): ImageData {
  if (img.width === w && img.height === h) return img
  const src = document.createElement('canvas')
  src.width = img.width; src.height = img.height
  src.getContext('2d')!.putImageData(img, 0, 0)
  const dst = document.createElement('canvas')
  dst.width = w; dst.height = h
  const ctx = dst.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, w, h)
  return ctx.getImageData(0, 0, w, h)
}
