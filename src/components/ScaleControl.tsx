import type { ScaleSetting } from '@/types'
import { resolveScale } from '@/lib/scale'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const PRESETS: { key: string; label: string; longSide: number }[] = [
  { key: '1080p', label: '1080p', longSide: 1920 },
  { key: '2k', label: '2K', longSide: 2560 },
  { key: '4k', label: '4K', longSide: 3840 },
]

export function ScaleControl({
  setting, onChange, srcW, srcH, disabled,
}: {
  setting: ScaleSetting
  onChange: (s: ScaleSetting) => void
  srcW: number
  srcH: number
  disabled?: boolean
}) {
  const plan = resolveScale(srcW, srcH, setting)
  const isTarget = setting.kind === 'target'

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex gap-1">
        <Button size="sm" variant={setting.kind === '2x' ? 'default' : 'outline'} disabled={disabled} onClick={() => onChange({ kind: '2x' })}>2×</Button>
        <Button size="sm" variant={setting.kind === '4x' ? 'default' : 'outline'} disabled={disabled} onClick={() => onChange({ kind: '4x' })}>4×</Button>
        <Button size="sm" variant={isTarget ? 'default' : 'outline'} disabled={disabled} onClick={() => onChange({ kind: 'target', longSide: 1920 })}>Target…</Button>
      </div>

      {isTarget && (
        <div className="flex items-center gap-2">
          <Select
            value={PRESETS.find((p) => p.longSide === setting.longSide)?.key ?? 'custom'}
            onValueChange={(v) => {
              const preset = PRESETS.find((p) => p.key === v)
              if (preset) onChange({ kind: 'target', longSide: preset.longSide })
            }}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number" min={64} max={8192} className="h-9 w-24"
            value={setting.longSide}
            disabled={disabled}
            onChange={(e) => onChange({ kind: 'target', longSide: Math.max(64, Math.min(8192, Number(e.target.value) || 0)) })}
          />
          <span className="text-xs text-muted-foreground">px long side</span>
        </div>
      )}

      <span className="text-xs text-muted-foreground">
        {srcW}×{srcH} → {plan.finalW}×{plan.finalH}
        {plan.note ? ` · ${plan.note}` : ''}
      </span>
    </div>
  )
}
