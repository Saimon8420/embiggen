import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Maximize2, Sparkles, ShieldCheck, Archive, Loader2 } from 'lucide-react'
import type { QueueItem, ScaleSetting } from '@/types'
import { useImageQueue } from '@/hooks/useImageQueue'
import { useUpscaler } from '@/hooks/useUpscaler'
import { resolveScale } from '@/lib/scale'
import { resampleTo } from '@/lib/resample'
import { Dropzone } from '@/components/Dropzone'
import { ModelLoadingPanel } from '@/components/ModelLoadingPanel'
import { ScaleControl } from '@/components/ScaleControl'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ImageStrip } from '@/components/ImageStrip'
import { ExportBar } from '@/components/ExportBar'
import { MoreTools } from '@/components/MoreTools'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'

const TILE = 256
const OVERLAP = 16

function FluidImage({ img }: { img: ImageData }) {
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-md border"
      style={{ maxWidth: img.width, aspectRatio: `${img.width} / ${img.height}` }}
    >
      <canvas
        className="absolute inset-0 h-full w-full"
        ref={(c) => {
          if (!c) return
          c.width = img.width; c.height = img.height
          c.getContext('2d')!.putImageData(img, 0, 0)
        }}
      />
    </div>
  )
}

export default function App() {
  const { items, activeId, setActiveId, addFiles, patch, remove } = useImageQueue()
  const { ready, progress, error, upscale } = useUpscaler()
  const [scale, setScale] = useState<ScaleSetting>({ kind: '2x' })
  const [busyId, setBusyId] = useState<string | null>(null)

  const active = useMemo(() => items.find((i) => i.id === activeId) ?? null, [items, activeId])

  async function upscaleOne(item: QueueItem) {
    const plan = resolveScale(item.width, item.height, scale)
    setBusyId(item.id)
    patch(item.id, (it) => ({ ...it, status: 'processing', tilesDone: 0, tilesTotal: 0, error: undefined }))
    try {
      let native: ImageData
      if (plan.runModel) {
        native = await upscale(item.id, item.original, TILE, OVERLAP, (done, total) =>
          patch(item.id, (it) => ({ ...it, tilesDone: done, tilesTotal: total })))
      } else {
        native = item.original
      }
      const result = resampleTo(native, plan.finalW, plan.finalH)
      patch(item.id, (it) => ({ ...it, result, status: 'done' }))
      if (plan.note) toast.message(plan.note)
    } catch (e) {
      patch(item.id, (it) => ({ ...it, status: 'error', error: e instanceof Error ? e.message : 'Upscale failed' }))
      toast.error(`Couldn't upscale ${item.fileName}`)
    } finally {
      setBusyId(null)
    }
  }

  async function upscaleAll() {
    for (const it of items) {
      if (it.status === 'done') continue
      await upscaleOne(it)
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
        {items.length === 0 && (
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
                Sharpen and enlarge photos 2× or 4× with AI super-resolution — at full
                resolution, 100% in your browser. No upload, no watermark, no signup.
              </p>
            </div>

            {error ? (
              <div className="mx-auto max-w-md rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
                <p className="font-medium text-destructive">Couldn’t load the upscaler model</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Check your connection and reload. A WebGPU-capable browser (recent Chrome or Edge) works best.
                </p>
              </div>
            ) : ready ? (
              <Dropzone onFiles={addFiles} />
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
                <Archive className="h-4 w-4 text-violet-500" /> Batch + ZIP
              </span>
            </div>
          </div>
        )}

        {ready && active && (
          <>
            <div className="rounded-2xl border bg-card/60 shadow-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2.5">
                <ScaleControl
                  setting={scale} onChange={setScale}
                  srcW={active.width} srcH={active.height}
                  disabled={busyId !== null}
                />
                <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground opacity-60">
                  <Sparkles className="h-3.5 w-3.5" /> Enhance faces
                  <span className="rounded bg-muted px-1 text-[10px] font-medium uppercase">soon</span>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" disabled={busyId !== null} onClick={upscaleAll}>
                    Upscale all
                  </Button>
                  <Button size="sm" disabled={busyId !== null} onClick={() => upscaleOne(active)}>
                    {busyId === active.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                    {busyId === active.id ? 'Upscaling…' : 'Upscale'}
                  </Button>
                </div>
              </div>
              <div className="bg-[radial-gradient(circle_at_center,theme(colors.muted.DEFAULT)_0%,transparent_70%)] p-4">
                <div className="relative">
                  {active.result ? (
                    <BeforeAfterSlider before={active.original} after={active.result} />
                  ) : (
                    <FluidImage img={active.original} />
                  )}
                  {active.status === 'processing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-background/70 backdrop-blur-sm">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      <p className="text-sm font-medium">
                        Upscaling…{active.tilesTotal ? ` tile ${active.tilesDone}/${active.tilesTotal}` : ''}
                      </p>
                      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${active.tilesTotal ? ((active.tilesDone ?? 0) / active.tilesTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {active.result
                    ? 'Drag the divider to compare. Download below.'
                    : 'Pick a scale, then hit Upscale.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ImageStrip items={items} activeId={activeId} onSelect={setActiveId} onRemove={remove} />
              <ExportBar active={active} all={items} />
            </div>
            <Dropzone onFiles={addFiles} compact />
          </>
        )}
      </main>

      <MoreTools current="embiggen" />
    </div>
  )
}
