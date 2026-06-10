import { describe, it, expect } from 'vitest'
import { outName } from './export'

describe('outName', () => {
  it('appends -embiggen and the format extension', () => {
    expect(outName('beach.JPG', 'png')).toBe('beach-embiggen.png')
    expect(outName('cat.png', 'jpeg')).toBe('cat-embiggen.jpg')
    expect(outName('x.webp', 'webp')).toBe('x-embiggen.webp')
  })
})
