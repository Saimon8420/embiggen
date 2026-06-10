export interface Tile {
  // source extract (core + overlap padding), in source pixels
  sx: number; sy: number; sw: number; sh: number
  // destination placement of the CORE region in output pixels (already ×scale)
  dx: number; dy: number; dw: number; dh: number
  // where the core starts inside the upscaled padded tile (×scale)
  cropX: number; cropY: number
}

// Split a srcW×srcH image into a grid of `tile`-sized cores, each padded by
// `overlap` px (clamped to image bounds) so the model has context and tile seams
// can be cropped away. `scale` is the model's upscale factor (4).
export function planTiles(srcW: number, srcH: number, tile: number, overlap: number, scale: number): Tile[] {
  const tiles: Tile[] = []
  for (let cy = 0; cy < srcH; cy += tile) {
    const ch = Math.min(tile, srcH - cy)
    for (let cx = 0; cx < srcW; cx += tile) {
      const cw = Math.min(tile, srcW - cx)
      const sx = Math.max(0, cx - overlap)
      const sy = Math.max(0, cy - overlap)
      const sxEnd = Math.min(srcW, cx + cw + overlap)
      const syEnd = Math.min(srcH, cy + ch + overlap)
      tiles.push({
        sx, sy, sw: sxEnd - sx, sh: syEnd - sy,
        dx: cx * scale, dy: cy * scale, dw: cw * scale, dh: ch * scale,
        cropX: (cx - sx) * scale, cropY: (cy - sy) * scale,
      })
    }
  }
  return tiles
}
