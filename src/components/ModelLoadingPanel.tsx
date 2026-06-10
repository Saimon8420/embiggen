import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function ModelLoadingPanel({ progress }: { progress: { loaded: number; total: number } | null }) {
  const pct = progress && progress.total ? Math.round((progress.loaded / progress.total) * 100) : null
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="font-medium">Loading the upscaler model…</p>
      <p className="text-sm text-muted-foreground">Downloads once, then cached on your device.</p>
      {pct !== null && <Progress value={pct} className="w-full" />}
    </div>
  )
}
