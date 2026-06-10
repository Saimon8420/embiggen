import { describe, it, expect } from 'vitest'
import { validateFile, MAX_BYTES } from './fileValidation'

function fakeFile(name: string, type: string, size: number): File {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('validateFile', () => {
  it('accepts a png under the size limit', () => {
    expect(validateFile(fakeFile('a.png', 'image/png', 1000))).toEqual({ ok: true })
  })
  it('rejects an unsupported type', () => {
    const r = validateFile(fakeFile('a.gif', 'image/gif', 1000))
    expect(r.ok).toBe(false)
  })
  it('rejects a file over the size limit', () => {
    const r = validateFile(fakeFile('a.png', 'image/png', MAX_BYTES + 1))
    expect(r.ok).toBe(false)
  })
  it('accepts jpeg and webp', () => {
    expect(validateFile(fakeFile('a.jpg', 'image/jpeg', 1000))).toEqual({ ok: true })
    expect(validateFile(fakeFile('a.webp', 'image/webp', 1000))).toEqual({ ok: true })
  })
  it('accepts a file exactly at the size limit', () => {
    expect(validateFile(fakeFile('a.png', 'image/png', MAX_BYTES))).toEqual({ ok: true })
  })
  it('rejects a file with an empty/unknown MIME type', () => {
    expect(validateFile(fakeFile('a.png', '', 1000)).ok).toBe(false)
  })
})
