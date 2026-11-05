import { FREE_PILLS } from '@/lib/free'
import { cn } from '@/lib/utils'

/** Welcome-screen row: "Pro features, free" + short pills from src/lib/free.ts. Same file in every redesigned tool. */
export function FreePills({ label = 'Pro features, free', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('mt-6', className)}>
      <p className="mb-2 text-center text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {FREE_PILLS.map((p) => (
          <li key={p} className="rounded-full bg-muted/70 px-2.5 py-1 text-[11.5px] font-semibold text-foreground/80 shadow-[inset_0_0_0_1px_hsl(var(--border))]">
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}
