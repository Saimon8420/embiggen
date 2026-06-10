export type Device = 'webgpu' | 'wasm'

export function pickDevice(nav: Navigator = navigator): Device {
  return 'gpu' in nav && (nav as any).gpu ? 'webgpu' : 'wasm'
}
