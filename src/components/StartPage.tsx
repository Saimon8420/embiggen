import { useRef, useState } from 'react'
import { ArrowRight, Check, ImagePlus } from 'lucide-react'
import { asset } from '@/lib/asset'
import { FREE } from '@/lib/free'
import { PAGES, type PageDef } from '@/lib/site'
import { cn } from '@/lib/utils'

const display = 'display-serif font-semibold'

function Heading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className={cn(display, 'text-balance text-[30px] leading-[1.1] tracking-[-0.015em] sm:text-[38px] [&_em]:italic [&_em]:text-brand-ink')}>
      {children}
    </h2>
  )
}

/** The page Google reads. Opening files (or the sample) switches to the editor. */
export function StartPage({ page, onFiles, onSample }: { page: PageDef; onFiles: (files: File[]) => void; onSample: () => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  return (
    <main>
      <section className="overflow-x-clip bg-[radial-gradient(60%_70%_at_85%_40%,hsl(var(--brand-lime)/0.13),transparent_70%)] px-4 pb-14 pt-10 sm:px-6 lg:pb-16 lg:pt-16">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="min-w-0">
            <p className="text-balance text-[12px] font-bold uppercase tracking-[0.06em] text-brand-ink">{page.kicker}</p>
            <h1 className={cn(display, 'mb-4 mt-3 text-balance text-[40px] leading-[1.08] tracking-[-0.02em] sm:text-[52px] lg:text-[56px]')}>
              {page.h1} <em className="italic text-brand-ink">{page.em}</em>
            </h1>
            <p className="max-w-[31em] text-pretty text-[16.5px] leading-relaxed text-foreground/75 sm:text-[18px]">{page.lede}</p>

            <input
              ref={input}
              type="file"
                            accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = [...(e.target.files ?? [])]
                e.target.value = ''
                if (f.length) onFiles(f)
              }}
            />
            <div
              onDragOver={(e) => (e.preventDefault(), setOver(true))}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setOver(false)
                const f = [...e.dataTransfer.files]
                if (f.length) onFiles(f)
              }}
              className={cn('mt-6 flex max-w-[560px] flex-wrap items-center gap-4 rounded-[18px] border-[1.5px] border-dashed bg-card p-4 transition-colors sm:p-5', over ? 'border-brand bg-brand-soft' : 'border-input')}
            >
              <span className="grid h-12 w-12 flex-none place-items-center rounded-[12px] bg-brand-soft text-brand-ink">
                <ImagePlus className="h-6 w-6" strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[15.5px]">Drop an image here</b>
                <span className="text-[13px] text-muted-foreground">JPG, PNG, WebP · up to 2048 px in, 8192 px out</span>
              </span>
              <button type="button" onClick={() => input.current?.click()} className="flex h-11 flex-none cursor-pointer items-center justify-center gap-1.5 rounded-[12px] bg-[#073049] px-4 text-[14.5px] font-bold text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-sm:w-full dark:bg-brand">
                Open an image <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
              {['No watermark', 'Full resolution', 'Nothing uploaded'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} /> {t}
                </span>
              ))}
              <button type="button" onClick={onSample} className="cursor-pointer font-semibold text-brand-ink underline-offset-2 hover:underline">
                Try a sample photo
              </button>
            </div>
          </div>

          <figure className="mx-auto grid w-full max-w-[540px] grid-cols-2 gap-3" aria-label="The same face before and after 4× upscaling">
            {[
              { src: '/examples/before.webp', label: 'Before · stretched 4×', tone: 'bg-neutral-700' },
              { src: '/examples/after.webp', label: 'After · AI 4×', tone: 'bg-emerald-800' },
            ].map((x) => (
              <div key={x.src} className="relative">
                <img src={asset(x.src)} alt="" width={480} height={600} className="w-full rounded-[14px] shadow-[0_24px_44px_-18px_rgba(7,48,73,0.45),0_0_0_1px_hsl(var(--border))]" />
                <span className={cn('absolute left-2 top-2 rounded-[9px] px-2.5 py-1 text-[12px] font-bold text-white', x.tone)}>{x.label}</span>
              </div>
            ))}
            <figcaption className="col-span-2 text-center text-[13px] text-muted-foreground">A 160 × 200 px photo, enlarged to 640 × 800 — real output.</figcaption>
          </figure>
        </div>
      </section>


      <section className="border-y bg-card px-4 py-14 sm:px-6 lg:py-16" aria-labelledby="free">
        <div className="mx-auto grid max-w-[1180px] items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <Heading id="free">
              Pro features, <em>free</em>
            </Heading>
            <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">What upscalers charge credits for. Here the AI runs on your device, so it costs nothing to give away.</p>
            <h3 className="mt-8 text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">How it works</h3>
            <ol className="mt-4 space-y-4">
              {page.steps.map((s, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className={cn(display, 'w-5 flex-none text-[28px] leading-none text-brand')}>{i + 1}</span>
                  <span className="text-[15px] leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="overflow-hidden rounded-[16px] bg-card shadow-[0_0_0_1px_hsl(var(--border))]">
            <div className="hidden grid-cols-[1.4fr_1.2fr_64px] gap-3 bg-muted/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.07em] text-muted-foreground sm:grid">
              <span>Feature</span>
              <span>Usually</span>
              <span>Embiggen</span>
            </div>
            <ul>
              {FREE.map((f) => (
                <li key={f.feature} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 border-t px-4 py-3 text-[14px] first:border-t-0 sm:grid-cols-[1.4fr_1.2fr_64px] sm:first:border-t">
                  <span>
                    <b className="font-semibold">{f.feature}</b>
                    {f.detail && <span className="text-muted-foreground"> — {f.detail}</span>}
                  </span>
                  <span className="col-start-1 row-start-2 text-[12.5px] text-muted-foreground line-through decoration-foreground/25 sm:col-start-auto sm:row-start-auto">{f.usually}</span>
                  <span className="row-span-2 flex items-center gap-1 font-extrabold text-emerald-700 sm:row-span-1 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} /> Free
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:py-16" aria-labelledby="faq">
        <div className="mx-auto max-w-[1180px]">
          <Heading id="faq">Questions</Heading>
          <div className="mt-7 gap-4 md:columns-2">
            {page.faqs.map((f, i) => (
              <details key={f.q} open={i === 0} className="group mb-3 break-inside-avoid rounded-[14px] bg-card px-5 py-4 shadow-[0_0_0_1px_hsl(var(--border))] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-semibold">
                  {f.q}
                  <span aria-hidden className="text-[18px] leading-none text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
          <nav aria-label="More upscaler pages" className="mt-10 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[13px] font-semibold text-muted-foreground">More:</span>
            {PAGES.filter((p) => p.slug !== page.slug).map((p) => (
              <a key={p.slug} href={asset(p.slug ? `/${p.slug}` : '/')} className="inline-flex h-9 items-center rounded-full bg-card px-3.5 text-[13.5px] font-semibold shadow-[inset_0_0_0_1px_hsl(var(--input))] transition-colors hover:bg-muted">
                {p.nav}
              </a>
            ))}
          </nav>
        </div>
      </section>
    </main>
  )
}
