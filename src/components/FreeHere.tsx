import { Check, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { FREE, FREE_INTRO, FREE_NOTE, FREE_TITLE } from '@/lib/free'

// Header chip "✦ N pro features, free" that opens a "usually paid → free here" table.
// Same file in every redesigned tool; each tool's own list lives in src/lib/free.ts.
export function FreeHere({ product, className }: { product: string; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-8 flex-none cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 sm:px-3 text-[12px] font-bold text-emerald-800 shadow-[inset_0_0_0_1px_rgba(5,150,105,0.22)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_rgba(5,150,105,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-emerald-500/10 dark:text-emerald-300',
            className,
          )}
          aria-label={`${FREE.length} pro features, free`}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="sm:hidden">Pro, free</span>
          <span className="hidden sm:inline">{FREE.length} pro features, free</span>
        </button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          'flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] max-w-[620px] flex-col gap-3 overflow-y-auto rounded-[22px] p-5 sm:p-6',
          'max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[calc(100dvh-3.5rem)] max-sm:w-full max-sm:max-w-none max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[24px]',
        )}
      >
        <span aria-hidden className="mx-auto -mt-1 block h-1 w-10 rounded-full bg-border sm:hidden" />
        <span className="w-fit rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">Free here</span>
        <DialogTitle className="text-[22px] font-bold tracking-[-0.01em]">{FREE_TITLE}</DialogTitle>
        <DialogDescription className="text-[13px] leading-relaxed">{FREE_INTRO}</DialogDescription>
        <div className="overflow-hidden rounded-[14px] shadow-[0_0_0_1px_hsl(var(--border))]">
          <div className="hidden grid-cols-[1.5fr_1.2fr_76px] gap-3 bg-muted/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground sm:grid">
            <span>Feature</span>
            <span>Usually</span>
            <span>{product}</span>
          </div>
          <ul>
            {FREE.map((f) => (
              <li key={f.feature} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 border-t px-4 py-2.5 text-[13px] first:border-t-0 sm:grid-cols-[1.5fr_1.2fr_76px] sm:first:border-t">
                <span>
                  <b className="font-semibold">{f.feature}</b>
                  {f.detail ? <span className="text-foreground/80"> — {f.detail}</span> : null}
                </span>
                <span className="col-start-1 row-start-2 text-[12px] text-muted-foreground line-through decoration-foreground/25 sm:col-start-auto sm:row-start-auto">{f.usually}</span>
                <span className="row-span-2 inline-flex items-center gap-1 font-extrabold text-emerald-700 sm:row-span-1 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> Free
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">{FREE_NOTE}</p>
      </DialogContent>
    </Dialog>
  )
}
