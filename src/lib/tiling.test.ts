import { describe, it, expect } from 'vitest'
import { planTiles } from './tiling'

describe('planTiles', () => {
  it('returns a single tile when the image is smaller than the tile size', () => {
    const tiles = planTiles(100, 80, 256, 16, 4)
    expect(tiles).toHaveLength(1)
    expect(tiles[0]).toEqual({
      sx: 0, sy: 0, sw: 100, sh: 80,
      dx: 0, dy: 0, dw: 400, dh: 320,
      cropX: 0, cropY: 0,
    })
  })

  it('pads inner tiles by the overlap and crops it back on stitch', () => {
    const tiles = planTiles(300, 100, 256, 16, 4)
    expect(tiles).toHaveLength(2)
    const [a, b] = tiles
    expect(a.sx).toBe(0)
    expect(a.sw).toBe(272)
    expect(a.dx).toBe(0)
    expect(a.dw).toBe(1024)
    expect(a.cropX).toBe(0)
    expect(b.sx).toBe(240)
    expect(b.sw).toBe(60)
    expect(b.dx).toBe(1024)
    expect(b.dw).toBe(176)
    expect(b.cropX).toBe(64)
  })

  it('covers the whole output with no gaps (dest core rects tile exactly)', () => {
    const W = 500, H = 300, S = 4
    const tiles = planTiles(W, H, 256, 16, S)
    const covered = new Set<string>()
    for (const t of tiles) {
      for (let y = t.dy; y < t.dy + t.dh; y++)
        for (let x = t.dx; x < t.dx + t.dw; x++) covered.add(`${x},${y}`)
    }
    expect(covered.size).toBe(W * S * H * S)
  })
})
