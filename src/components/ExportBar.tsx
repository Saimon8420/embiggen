import { Download, Archive, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import type { QueueItem } from '@/types'
import { downloadImage, downloadAll, type ExportFormat } from '@/lib/export'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const FORMATS: { value: ExportFormat; label: string; hint: string }[] = [
  { value: 'png', label: 'PNG', hint: 'Lossless · transparency' },
  { value: 'jpeg', label: 'JPG', hint: 'Smallest · photos' },
  { value: 'webp', label: 'WebP', hint: 'Modern · small + sharp' },
]

function FormatMenu({ trigger, onPick }: { trigger: React.ReactNode; onPick: (f: ExportFormat) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {FORMATS.map((f) => (
          <DropdownMenuItem key={f.value} onClick={() => onPick(f.value)} className="flex-col items-start gap-0.5">
            <span className="font-medium">{f.label}</span>
            <span className="text-xs text-muted-foreground">{f.hint}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ExportBar({ active, all }: { active: QueueItem | null; all: QueueItem[] }) {
  const done = all.filter((i) => i.result)

  async function one(format: ExportFormat) {
    if (!active?.result) return
    try { await downloadImage(active.result, active.fileName, format) } catch { toast.error('Export failed') }
  }

  async function batch(format: ExportFormat) {
    try {
      await downloadAll(done.map((it) => ({ img: it.result!, baseName: it.fileName })), format)
    } catch { toast.error('Export failed') }
  }

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
      <FormatMenu
        onPick={one}
        trigger={
          <Button variant="outline" disabled={!active?.result} className="min-w-0 justify-center">
            <Download className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Download</span>
            <ChevronDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        }
      />
      <FormatMenu
        onPick={batch}
        trigger={
          <Button variant="outline" disabled={done.length < 2} className="min-w-0 justify-center">
            <Archive className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Download all</span>
            <ChevronDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        }
      />
    </div>
  )
}
