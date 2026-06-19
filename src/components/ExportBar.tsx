import { useState } from 'react'
import { Download, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { type ExportFormat } from '@/lib/export'
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

export function ExportBar({
  disabled,
  onExport,
}: {
  disabled: boolean
  onExport: (format: ExportFormat) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)

  async function save(format: ExportFormat) {
    setSaving(true)
    try { await onExport(format) } catch { toast.error('Export failed') } finally { setSaving(false) }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || saving} className="w-full justify-center sm:w-auto">
          {saving
            ? <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
            : <Download className="mr-2 h-4 w-4 shrink-0" />}
          <span className="truncate">{saving ? 'Saving…' : 'Download'}</span>
          <ChevronDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {FORMATS.map((f) => (
          <DropdownMenuItem key={f.value} onClick={() => save(f.value)} className="flex-col items-start gap-0.5">
            <span className="font-medium">{f.label}</span>
            <span className="text-xs text-muted-foreground">{f.hint}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
