import { X } from 'lucide-react'
import type { QueueItem } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_COLOR: Record<QueueItem['status'], string> = {
  queued: 'bg-muted-foreground/40', processing: 'bg-amber-500', done: 'bg-emerald-500', error: 'bg-destructive',
}

export function ImageStrip({ items, activeId, onSelect, onRemove }: {
  items: QueueItem[]; activeId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void
}) {
  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 sm:flex-1">
      {items.map((it) => (
        <button key={it.id} onClick={() => onSelect(it.id)}
          className={cn('relative h-16 w-16 shrink-0 overflow-hidden rounded-md border', it.id === activeId && 'ring-2 ring-primary')}>
          <ThumbCanvas item={it} />
          <span className={cn('absolute bottom-1 left-1 h-2 w-2 rounded-full ring-1 ring-white', STATUS_COLOR[it.status])} />
          <span onClick={(e) => { e.stopPropagation(); onRemove(it.id) }}
            className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white"><X className="h-3 w-3" /></span>
        </button>
      ))}
    </div>
  )
}

function ThumbCanvas({ item }: { item: QueueItem }) {
  return (
    <canvas className="h-full w-full object-cover" ref={(c) => {
      if (!c) return
      c.width = item.width; c.height = item.height
      c.getContext('2d')!.putImageData(item.original, 0, 0)
    }} />
  )
}
