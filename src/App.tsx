import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Maximize2, Sparkles, Loader2, ImagePlus } from 'lucide-react'
import type { ScaleSetting } from '@/types'
import { useUpscaler } from '@/hooks/useUpscaler'
import { resolveScale } from '@/lib/scale'
import { resampleTo } from '@/lib/resample'
import { drawCapped } from '@/lib/draw'
import { downloadImage, saveResultBlob, type ExportFormat } from '@/lib/export'
import { ScaleControl } from '@/components/ScaleControl'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ExportBar } from '@/components/ExportBar'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Lockup } from '@/components/Brand'
import { FreeHere } from '@/components/FreeHere'
import { ToolsButton } from '@/components/ToolsDialog'
import { StartPage } from '@/components/StartPage'
import { SiteFooter } from '@/components/SiteFooter'
import { asset } from '@/lib/asset'
import { BASE, EDITOR_SLUG, PAGES, type Slug } from '@/lib/site'

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
      style={{ maxWidth: Math.max(img.width, 520), aspectRatio: `${img.width} / ${img.height}` }}
    >
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  )
}

export default function App({ initialSlug }: { initialSlug: Slug | typeof EDITOR_SLUG }) {
  const [slug, setSlug] = useState<Slug>(initialSlug === EDITOR_SLUG ? '' : initialSlug)
  const page = PAGES.find((p) => p.slug === slug) ?? PAGES[0]
  const [view, setView] = useState<'start' | 'editor'>('start')
  const { ready, progress, error, upscale, exportResult, release } = useUpscaler()
  const [scale, setScale] = useState<ScaleSetting>({ kind: page.scale })

  useEffect(() => {
    if (initialSlug === EDITOR_SLUG) history.replaceState(null, '', asset('/'))
    const onPop = () => {
      const rest = location.pathname.replace(/\/+$/, '').split(BASE)[1]?.replace(/^\//, '') ?? ''
      if (rest !== EDITOR_SLUG) {
        setView('start')
        setSlug((PAGES.find((p) => p.slug === rest)?.slug ?? '') as Slug)
      }
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [initialSlug])

  const goStart = (s: Slug) => {
    setView('start')
    setSlug(s)
    history.pushState(null, '', asset(s ? `/${s}` : '/'))
    scrollTo(0, 0)
  }
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
      setView('editor')
      history.pushState(null, '', asset(`/${EDITOR_SLUG}`))
      scrollTo(0, 0)
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

  const pct = progress && progress.total ? Math.round((progress.loaded / progress.total) * 100) : null
  const aiChip = error ? (
    <span className="hidden text-[12px] font-semibold text-destructive sm:inline">AI failed to load</span>
  ) : !ready ? (
    <span className="hidden items-center gap-1.5 text-[12px] font-semibold text-muted-foreground sm:inline-flex" aria-live="polite">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading AI{pct !== null && pct < 100 ? ` ${pct}%` : '…'}
    </span>
  ) : (
    <span className="hidden items-center gap-1.5 text-[12px] font-semibold text-emerald-700 sm:inline-flex dark:text-emerald-400">
      <Sparkles className="h-3.5 w-3.5" /> AI ready
    </span>
  )

  const openSample = async () => {
    const blob = await (await fetch(asset('/examples/sample.jpg'))).blob()
    setScale({ kind: '4x' })
    void loadFile([new File([blob], 'sample-portrait.jpg', { type: 'image/jpeg' })])
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 flex-none items-center gap-1.5 border-b bg-card/90 px-3 backdrop-blur-md sm:gap-2 sm:px-4">
        <Lockup onHome={(e) => (e.preventDefault(), goStart(''))} />
        {view === 'editor' && img && <span className="ml-2 hidden min-w-0 max-w-[30ch] truncate text-[13.5px] font-semibold md:block">{img.fileName}</span>}
        <span className="flex-1" />
        {aiChip}
        <FreeHere product="Embiggen" className="hidden md:inline-flex" />
        <ToolsButton current="embiggen" />
        <ModeToggle />
        {view === 'start' && (
          <button
            type="button"
            onClick={() => document.querySelector<HTMLInputElement>('main input[type=file]')?.click()}
            className="ml-0.5 hidden h-9 flex-none items-center rounded-[11px] bg-foreground px-3.5 text-[13px] font-semibold text-background transition-opacity hover:opacity-90 sm:flex"
          >
            Open an image
          </button>
        )}
      </header>

      {view === 'start' || !img ? (
        <>
          <StartPage page={page} onFiles={(f) => void loadFile(f)} onSample={() => void openSample()} />
          <SiteFooter />
        </>
      ) : (
        <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 p-3 sm:p-5">
          <div className="rounded-[18px] bg-card shadow-[0_0_0_1px_hsl(var(--border))]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2.5">
              <ScaleControl setting={scale} onChange={setScale} srcW={img.width} srcH={img.height} disabled={busy} />
              <Button className="ml-auto h-10 rounded-[11px] bg-[#073049] px-4 font-bold text-white hover:bg-[#073049]/90 dark:bg-brand" disabled={busy || !ready} onClick={doUpscale}>
                {busy || !ready ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                {!ready ? 'Loading AI…' : busy ? 'Upscaling…' : 'Upscale'}
              </Button>
            </div>
            <div className="bg-[hsl(var(--stage))] p-3 sm:p-5">
              <div className="relative">
                {result ? <BeforeAfterSlider before={img.original} after={result.display} /> : <FluidImage img={img.original} />}
                {busy && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-background/70 backdrop-blur-sm" aria-live="polite">
                    <Loader2 className="h-7 w-7 animate-spin text-brand" />
                    <p className="text-sm font-medium">Upscaling…{tiles.total ? ` tile ${tiles.done}/${tiles.total}` : ''}</p>
                    <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-brand transition-all" style={{ width: `${tiles.total ? (tiles.done / tiles.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {result ? `${img.width}×${img.height} → ${result.width}×${result.height}. Drag the divider to compare.` : error ? `Couldn’t load the upscaler: ${error}` : 'Pick a scale, then hit Upscale.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              className="h-10"
              disabled={busy}
              onClick={() => {
                setImg(null)
                clearResult()
                setStatus('idle')
                goStart(slug)
              }}
            >
              <ImagePlus className="mr-2 h-4 w-4" /> New image
            </Button>
            <ExportBar disabled={!result || busy} onExport={handleExport} />
          </div>
        </main>
      )}
    </div>
  )
}
