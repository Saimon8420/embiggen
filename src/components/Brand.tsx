import { cn } from '@/lib/utils'
import { asset } from '@/lib/asset'
import { DOETRA } from '@/lib/site'

/** Embiggen's own mark: a small square of pixels growing into a big sharp corner. */
export function EmbiggenMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="embiggen-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#24b4e4" />
          <stop offset="1" stopColor="#0c486c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#embiggen-g)" />
      <rect x="7" y="17" width="3.5" height="3.5" rx=".6" fill="#8fdcf6" />
      <rect x="11" y="17" width="3.5" height="3.5" rx=".6" fill="#fff" />
      <rect x="7" y="21" width="3.5" height="3.5" rx=".6" fill="#fff" />
      <rect x="11" y="21" width="3.5" height="3.5" rx=".6" fill="#8fdcf6" />
      <path d="M17 7h8v8M25 7l-8.5 8.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Lockup({ className, onHome }: { className?: string; onHome?: (e: React.MouseEvent) => void }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 whitespace-nowrap', className)}>
      <a href={asset('/')} onClick={onHome} className="flex items-center gap-2.5 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Embiggen home">
        <EmbiggenMark className="h-8 w-8 flex-none" />
        <span className="text-[17px] font-extrabold tracking-[-0.02em]">Embiggen</span>
      </a>
      <a href={DOETRA.home} className="hidden items-center gap-1.5 rounded-full py-1 pl-1.5 pr-2.5 text-[11.5px] font-semibold text-muted-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))] transition-colors hover:text-foreground min-[420px]:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        by
        <img src={asset('/doetra-mark.png')} alt="" width={16} height={16} className="h-4 w-4" />
        Doetra
      </a>
    </span>
  )
}
