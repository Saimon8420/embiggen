import { useMemo, useState } from 'react'
import { ArrowUpRight, Check, LayoutGrid, Search, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TOOLS } from '@/components/MoreTools'
import { FreeHere } from '@/components/FreeHere'
import { cn } from '@/lib/utils'

// Shared "More free tools" directory. Same file in every redesigned tool; the list itself lives in MoreTools.tsx.
type Cat = 'image' | 'media' | 'docs' | 'design' | 'dev' | 'fun'
const CATS: { id: Cat; label: string }[] = [
  { id: 'image', label: 'Photos' },
  { id: 'media', label: 'Video & audio' },
  { id: 'docs', label: 'Documents & text' },
  { id: 'design', label: 'Design' },
  { id: 'dev', label: 'Developer' },
  { id: 'fun', label: 'Fun & social' },
]
const CAT_OF: Record<string, Cat> = {
  poof: 'image', vanish: 'image', embiggen: 'image', squish: 'image', unheic: 'image', scrub: 'image', smudge: 'image', stamp: 'image', doppel: 'image', hue: 'image',
  capsy: 'media', aloud: 'media',
  quill: 'docs', glean: 'docs', crux: 'docs', askdoc: 'docs', sift: 'docs', pulse: 'docs', billd: 'docs',
  tabby: 'design', vexel: 'design', bezel: 'design', ogle: 'design', quotely: 'design', hueology: 'design', inkly: 'design', qrio: 'design',
  morph: 'dev', snippy: 'dev',
  sticka: 'fun', chirp: 'fun', tierly: 'fun', wordly: 'fun', flippy: 'fun', wordsy: 'fun', crossly: 'fun', memely: 'fun',
}
const catOf = (key: string): Cat => CAT_OF[key] ?? 'fun'

export function ToolsDialogContent({ current }: { current: string }) {
  const [cat, setCat] = useState<Cat | 'all'>('all')
  const [q, setQ] = useState('')
  const pool = useMemo(() => TOOLS.filter((t) => t.key !== current), [current])
  const query = q.trim().toLowerCase()
  const shown = pool.filter((t) => (cat === 'all' || catOf(t.key) === cat) && `${t.name} ${t.blurb}`.toLowerCase().includes(query))
  const count = (c: Cat | 'all') => (c === 'all' ? pool.length : pool.filter((t) => catOf(t.key) === c).length)
  const groups = CATS.filter((c) => shown.some((t) => catOf(t.key) === c.id))
  const chip = 'flex-none cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <DialogContent
      aria-describedby="tools-desc"
      className={cn(
        // desktop: centred dialog
        'flex max-h-[min(720px,calc(100dvh-2rem))] w-[calc(100vw-1.5rem)] max-w-[780px] flex-col gap-0 overflow-hidden rounded-[22px] p-0 [&>button.absolute]:hidden',
        // phones: full-height bottom sheet
        'max-sm:bottom-0 max-sm:top-auto max-sm:h-[calc(100dvh-3.5rem)] max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[24px]',
      )}
    >
      <div className="flex-none px-4 pt-4 sm:px-6 sm:pt-6">
        <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="text-[18px] font-extrabold tracking-[-0.01em] sm:text-[20px]">More free tools</DialogTitle>
            <DialogDescription id="tools-desc" className="mt-1 text-[13px]">
              {pool.length} private tools that run in your browser
            </DialogDescription>
          </div>
          <DialogClose className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close">
            <X className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </DialogClose>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <FreeHere product={TOOLS.find((t) => t.key === current)?.name ?? 'Here'} className="h-7" />
          {['No sign-up', 'No watermark', 'Nothing uploaded'].map((b) => (
            <span key={b} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-bold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Check className="h-3 w-3" strokeWidth={2.6} />
              {b}
            </span>
          ))}
        </div>
        <label className="mt-4 flex h-11 items-center gap-2 rounded-[12px] bg-card px-3 text-muted-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))] transition-shadow focus-within:shadow-[inset_0_0_0_1.5px_hsl(var(--ring))]">
          <Search className="h-[18px] w-[18px] flex-none" strokeWidth={1.7} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 40))}
            placeholder="Search tools — try “pdf”, “gif”, “compress”"
            aria-label="Search tools"
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-muted">
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </label>
        <div role="group" aria-label="Categories" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-3 pt-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
          {([{ id: 'all' as const, label: 'All' }, ...CATS]).map((c) => (
            <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={cn(chip, cat === c.id ? 'bg-foreground text-background' : 'text-foreground/80 shadow-[inset_0_0_0_1px_hsl(var(--border))] hover:bg-muted')}>
              {c.label}
              <span className={cn('ml-1.5 tabular-nums', cat === c.id ? 'text-background/60' : 'text-muted-foreground')}>{count(c.id)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t bg-muted/30 px-4 pb-5 pt-3 sm:px-6">
        {shown.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-muted-foreground">No tool matches “{q.trim()}”.</p>
        ) : (
          groups.map((g) => (
            <section key={g.id} aria-label={g.label}>
              <h3 className="mb-2 mt-2 px-0.5 text-[11px] font-bold uppercase tracking-[0.07em] text-muted-foreground">{g.label}</h3>
              <ul className="mb-3 grid grid-cols-1 gap-2 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3">
                {shown
                  .filter((t) => catOf(t.key) === g.id)
                  .map(({ key, name, blurb, url, Icon, gradient }) => (
                    <li key={key} className="min-w-0">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-[60px] items-center gap-3 rounded-[14px] bg-card p-2.5 shadow-[0_0_0_1px_hsl(var(--border))] transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_0_0_1px_hsl(var(--border)),0_10px_22px_-14px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className={cn('flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]', gradient)}>
                          <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-bold">{name}</span>
                          <span className="block truncate text-[12px] text-muted-foreground">{blurb}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 flex-none text-muted-foreground transition-[opacity,transform] duration-200 group-hover:-translate-y-px group-hover:translate-x-px sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100" strokeWidth={1.8} />
                      </a>
                    </li>
                  ))}
              </ul>
            </section>
          ))
        )}
      </div>
      <div className="flex flex-none items-center justify-between gap-3 border-t px-4 py-2.5 text-[12px] text-muted-foreground sm:px-6">
        <span>Free · Private · In-browser</span>
        <span className="hidden sm:inline">Esc to close</span>
      </div>
    </DialogContent>
  )
}

/** Footer row for page-style tools: "More free tools" + a button that opens the directory. */
export function ToolsFooter({ current }: { current: string }) {
  const n = TOOLS.filter((t) => t.key !== current).length
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-bold">More free, private tools</p>
          <p className="text-[12.5px] text-muted-foreground">{n} tools that run in your browser — no sign-up, nothing uploaded.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button type="button" className="inline-flex h-10 flex-none cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] font-semibold shadow-[inset_0_0_0_1px_hsl(var(--border))] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <LayoutGrid className="h-4 w-4" strokeWidth={1.7} /> Browse all tools
            </button>
          </DialogTrigger>
          <ToolsDialogContent current={current} />
        </Dialog>
      </div>
    </footer>
  )
}

/** Header button that opens the directory. */
export function ToolsButton({ current, className }: { current: string; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" aria-label="More free tools" title="More free tools" className={cn('flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-[10px] text-foreground/75 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}>
          <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>
      </DialogTrigger>
      <ToolsDialogContent current={current} />
    </Dialog>
  )
}
