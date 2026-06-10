import { describe, it, expect } from 'vitest'
import { resolveScale, MAX_LONG_SIDE } from './scale'

describe('resolveScale', () => {
  it('2× runs the model and doubles dimensions', () => {
    expect(resolveScale(1000, 500, { kind: '2x' })).toEqual({ runModel: true, finalW: 2000, finalH: 1000, note: undefined })
  })
  it('4× runs the model and quadruples dimensions', () => {
    expect(resolveScale(1000, 500, { kind: '4x' })).toEqual({ runModel: true, finalW: 4000, finalH: 2000, note: undefined })
  })
  it('target within AI range hits the exact long side', () => {
    const p = resolveScale(1000, 500, { kind: 'target', longSide: 2000 })
    expect(p.runModel).toBe(true)
    expect(Math.max(p.finalW, p.finalH)).toBe(2000)
    expect(p.note).toBeUndefined()
  })
  it('target that downscales skips the model', () => {
    const p = resolveScale(1000, 500, { kind: 'target', longSide: 500 })
    expect(p.runModel).toBe(false)
    expect(p).toMatchObject({ finalW: 500, finalH: 250 })
  })
  it('target beyond 4× still runs the model and flags interpolation', () => {
    const p = resolveScale(1000, 500, { kind: 'target', longSide: 8000 })
    expect(p.runModel).toBe(true)
    expect(p.note).toMatch(/Beyond AI range/)
  })
  it('clamps output to MAX_LONG_SIDE and notes it', () => {
    const p = resolveScale(3000, 2000, { kind: '4x' })
    expect(Math.max(p.finalW, p.finalH)).toBe(MAX_LONG_SIDE)
    expect(p.note).toMatch(/Capped/)
  })
})
