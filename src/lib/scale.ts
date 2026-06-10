import type { ScaleSetting } from '../types'

export const MODEL_SCALE = 4
export const MAX_LONG_SIDE = 8192

export interface ScalePlan {
  runModel: boolean
  finalW: number
  finalH: number
  note?: string
}

// Decide what to do for a given source size + requested scale. One ×4 model
// serves all modes: run it then resample to the final size (or skip it when a
// target only downscales).
export function resolveScale(srcW: number, srcH: number, setting: ScaleSetting): ScalePlan {
  const srcLong = Math.max(srcW, srcH)
  const factor =
    setting.kind === '2x' ? 2 :
    setting.kind === '4x' ? 4 :
    setting.longSide / srcLong

  let note: string | undefined
  if (setting.kind === 'target' && factor > MODEL_SCALE) {
    note = 'Beyond AI range — extra size is interpolated.'
  }

  let finalW = Math.round(srcW * factor)
  let finalH = Math.round(srcH * factor)

  const finalLong = Math.max(finalW, finalH)
  if (finalLong > MAX_LONG_SIDE) {
    const k = MAX_LONG_SIDE / finalLong
    finalW = Math.round(finalW * k)
    finalH = Math.round(finalH * k)
    note = `Capped at ${MAX_LONG_SIDE}px to protect memory.`
  }

  return { runModel: factor > 1, finalW, finalH, note }
}
