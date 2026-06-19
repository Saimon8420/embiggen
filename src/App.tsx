import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Maximize2, Sparkles, ShieldCheck, Loader2, ImagePlus } from 'lucide-react'
import type { ScaleSetting } from '@/types'
import { useUpscaler } from '@/hooks/useUpscaler'
import { resolveScale } from '@/lib/scale'
import { resampleTo } from '@/lib/resample'
import { drawCapped } from '@/lib/draw'
import { downloadImage, saveResultBlob, type ExportFormat } from '@/lib/export'
import { Dropzone } from '@/components/Dropzone'
import { ModelLoadingPanel } from '@/components/ModelLoadingPanel'
import { ScaleControl } from '@/components/ScaleControl'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ExportBar } from '@/components/ExportBar'
import { MoreTools } from '@/components/MoreTools'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'

const TILE = 256
const OVERLAP = 16
// Cap the input's long side so the worker's ×4 intermediate stays ≤ ~8192px
// (matching the output cap). A huge upload is downscaled to this first — keeps
// memory bounded and loading fast, and upscaling a 20MP photo isn't meaningful.
const MAX_INPUT_LONG = 2048

type Loaded = { fileName: string; width: number; height: number; original: ImageData }
type Status = 'idle' | 'processing' | 'done' | 'error'
// The result the main thread holds: a small, capped display source only. The
// full-resolution pixels live in the worker (exported on demand) — except the
// pure-downscale path, whose result is small and bounded, so we keep it here
// (`local`) and export it directly.
type Result = {
  display: ImageData | ImageBitmap
  width: number
  height: number
  local: ImageData | null
}

function FluidImage({ img }: { img: ImageData }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) void drawCapped(ref.current, img)
  }, [img])
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-md border"
      style={{ maxWidth: img.width, aspectRatio: `${img.width} / ${img.height}` }}
    >
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  )
}

export default function App() {
  const { ready, progress, error, upscale, exportResult, release } = useUpscaler()
  const [scale, setScale] = useState<ScaleSetting>({ kind: '2x' })
  const [img, setImg] = useState<Loaded | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [tiles, setTiles] = useState<{ done: number; total: number }>({ done: 0, total: 0 })
  const busy = status === 'processing'

  // Swap in a new result, closing the previous display bitmap so old capped
  // frames don't linger. (The heavy full-res data never lived here.)
  function replaceResult(next: Result | null) {
    setResult((prev) => {
      if (prev && prev.display instanceof ImageBitmap && prev.display !== next?.display) prev.display.close()
      return next
    })
  }

  // Fully reset the current work: drop the display result here and tell the
  // worker to free its retained full-res canvas.
  function clearResult() {
    replaceResult(null)
    release()
  }

  async function loadFile(files: File[]) {
    const f = files[0]
    if (!f) return
    try {
      const bmp = await createImageBitmap(f)
      const s = Math.min(1, MAX_INPUT_LONG / Math.max(bmp.width, bmp.height))
      const w = Math.max(1, Math.round(bmp.width * s))
      const h = Math.max(1, Math.round(bmp.height * s))
      const c = new OffscreenCanvas(w, h)
      const ctx = c.getContext('2d')!
      if (s < 1) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high' }
      ctx.drawImage(bmp, 0, 0, w, h)
      const original = ctx.getImageData(0, 0, w, h)
      bmp.close()
      if (s < 1) toast.message(`Large image scaled to ${w}×${h} first, then upscaled.`)
      setImg({ fileName: f.name, width: w, height: h, original })
      clearResult()
      setStatus('idle')
    } catch {
      toast.error("Couldn't open that image.")
    }
  }

  async function doUpscale() {
    if (!img) return
    const plan = resolveScale(img.width, img.height, scale)
    setStatus('processing')
    setTiles({ done: 0, total: 0 })
    replaceResult(null)
    try {
      if (plan.runModel) {
        const r = await upscale('single', img.original, TILE, OVERLAP, plan.finalW, plan.finalH, (done, total) => setTiles({ done, total }))
        replaceResult({ display: r.bitmap, width: r.width, height: r.height, local: null })
      } else {
        // Pure downscale — small, bounded; keep it on the main thread for export.
        const data = resampleTo(img.original, plan.finalW, plan.finalH)
        replaceResult({ display: data, width: data.width, height: data.height, local: data })
      }
      setStatus('done')
      if (plan.note) toast.message(plan.note)
    } catch (e) {
      setStatus('error')
      toast.error(e instanceof Error ? e.message : 'Upscale failed')
    }
  }

  async function handleExport(format: ExportFormat) {
    if (!result) return
    const name = img?.fileName ?? 'image'
    if (result.local) {
      await downloadImage(result.local, name, format)
    } else {
      const blob = await exportResult(format)
      saveResultBlob(blob, name, format)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background via-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
              <Maximize2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">Embiggen</h1>
              <p className="text-xs text-muted-foreground">Upscale any image — in your browser</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% private — nothing leaves your device
            </span>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 p-4">
        {!img && (
          <div className="relative mx-auto max-w-xl space-y-6 py-6 text-center sm:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-3xl"
            />
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" /> Free · Private · In-browser AI
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Upscale any{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  image
                </span>
              </h2>
              <p className="text-muted-foreground">
                Sharpen and enlarge a photo 2× or 4× with AI super-resolution — at full
                resolution, 100% in your browser. No upload, no watermark, no signup.
              </p>
            </div>

            {error ? (
              <div className="mx-auto max-w-md rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
                <p className="font-medium text-destructive">Couldn’t load the upscaler model</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Check your connection and reload. A recent Chrome or Edge works best.
                </p>
              </div>
            ) : ready ? (
              <Dropzone onFiles={loadFile} />
            ) : (
              <ModelLoadingPanel progress={progress} />
            )}

            <div className="flex flex-wrap items-center justify-center gap-2.5 text-sm">
              <span className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> No upload
              </span>
              <span className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-muted-foreground">
                <Maximize2 className="h-4 w-4 text-indigo-500" /> Full resolution
              </span>
              <span className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-muted-foreground">
                <Sparkles className="h-4 w-4 text-violet-500" /> No watermark
              </span>
            </div>
          </div>
        )}

        {ready && img && (
          <>
            <div className="rounded-2xl border bg-card/60 shadow-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2.5">
                <ScaleControl
                  setting={scale} onChange={setScale}
                  srcW={img.width} srcH={img.height}
                  disabled={busy}
                />
                <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground opacity-60">
                  <Sparkles className="h-3.5 w-3.5" /> Enhance faces
                  <span className="rounded bg-muted px-1 text-[10px] font-medium uppercase">soon</span>
                </div>
                <Button className="ml-auto" size="sm" disabled={busy} onClick={doUpscale}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                  {busy ? 'Upscaling…' : 'Upscale'}
                </Button>
              </div>
              <div className="bg-[radial-gradient(circle_at_center,theme(colors.muted.DEFAULT)_0%,transparent_70%)] p-4">
                <div className="relative">
                  {result ? (
                    <BeforeAfterSlider before={img.original} after={result.display} />
                  ) : (
                    <FluidImage img={img.original} />
                  )}
                  {busy && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-background/70 backdrop-blur-sm">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      <p className="text-sm font-medium">
                        Upscaling…{tiles.total ? ` tile ${tiles.done}/${tiles.total}` : ''}
                      </p>
                      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${tiles.total ? (tiles.done / tiles.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {result ? 'Drag the divider to compare. Download below.' : 'Pick a scale, then hit Upscale.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" size="sm" disabled={busy} onClick={() => { setImg(null); clearResult(); setStatus('idle') }}>
                <ImagePlus className="mr-2 h-4 w-4" /> New image
              </Button>
              <ExportBar disabled={!result || busy} onExport={handleExport} />
            </div>
          </>
        )}
      </main>

      <MoreTools current="embiggen" />
    </div>
  )
}
