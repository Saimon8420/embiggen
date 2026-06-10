import { describe, it, expect } from 'vitest'
import { pickDevice } from './device'

describe('pickDevice', () => {
  it('returns webgpu when navigator.gpu exists', () => {
    expect(pickDevice({ gpu: {} } as unknown as Navigator)).toBe('webgpu')
  })
  it('returns wasm when navigator.gpu is missing', () => {
    expect(pickDevice({} as Navigator)).toBe('wasm')
  })
})
