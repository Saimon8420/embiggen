import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import type { ExportFormat } from '../types'

export type { ExportFormat }
const MIME: Record<ExportFormat, string> = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }
const EXT: Record<ExportFormat, string> = { png: 'png', jpeg: 'jpg', webp: 'webp' }

export function outName(baseName: string, format: ExportFormat): string {
  const stem = baseName.replace(/\.[^.]+$/, '')
  return `${stem}-embiggen.${EXT[format]}`
}

function imageDataToCanvas(img: ImageData): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  c.getContext('2d')!.putImageData(img, 0, 0)
  return c
}

function toBlob(canvas: HTMLCanvasElement, format: ExportFormat): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), MIME[format], format === 'png' ? undefined : 0.92)
  })
}

export async function downloadImage(img: ImageData, baseName: string, format: ExportFormat) {
  const blob = await toBlob(imageDataToCanvas(img), format)
  saveAs(blob, outName(baseName, format))
}

// Save a Blob the worker already encoded from the full-res result. Keeps the
// main thread out of the giant-canvas encode path entirely.
export function saveResultBlob(blob: Blob, baseName: string, format: ExportFormat) {
  saveAs(blob, outName(baseName, format))
}

export async function downloadAll(items: { img: ImageData; baseName: string }[], format: ExportFormat) {
  const zip = new JSZip()
  for (const { img, baseName } of items) zip.file(outName(baseName, format), await toBlob(imageDataToCanvas(img), format))
  saveAs(await zip.generateAsync({ type: 'blob' }), 'embiggen-batch.zip')
}
