import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function normalizeHex(v: string) {
  const s = v.startsWith('#') ? v : `#${v}`
  return s.slice(0, 7)
}

export function ColorPicker({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (color: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start gap-2 font-normal', className)}
        >
          <span
            className="h-4 w-4 shrink-0 rounded-sm border"
            style={{ backgroundColor: value }}
          />
          <span className="flex-1 text-left tabular-nums">
            {value.toUpperCase()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto space-y-3 p-3">
        <HexColorPicker color={value} onChange={onChange} />
        <Input
          value={value}
          onChange={(e) => onChange(normalizeHex(e.target.value))}
          spellCheck={false}
          className="h-8 font-mono uppercase"
        />
      </PopoverContent>
    </Popover>
  )
}
