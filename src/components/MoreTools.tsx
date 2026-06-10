import { Wand2, Captions, Sparkles, Maximize2, ArrowUpRight, type LucideIcon } from 'lucide-react'

type ToolKey = 'poof' | 'capsy' | 'vanish' | 'embiggen'

const TOOLS: { key: ToolKey; name: string; blurb: string; url: string; Icon: LucideIcon; gradient: string }[] = [
  { key: 'poof', name: 'Poof', blurb: 'Remove image backgrounds', url: 'https://poof-eight.vercel.app', Icon: Wand2, gradient: 'from-violet-500 to-fuchsia-500' },
  { key: 'capsy', name: 'Capsy', blurb: 'Auto-caption your videos', url: 'https://capsy-two.vercel.app', Icon: Captions, gradient: 'from-teal-500 to-cyan-500' },
  { key: 'vanish', name: 'Vanish', blurb: 'Erase objects from photos', url: 'https://vanish-bice.vercel.app', Icon: Sparkles, gradient: 'from-violet-500 to-fuchsia-500' },
  { key: 'embiggen', name: 'Embiggen', blurb: 'Upscale any image', url: 'https://embiggen.vercel.app', Icon: Maximize2, gradient: 'from-indigo-500 to-violet-500' },
]

export function MoreTools({ current }: { current: ToolKey }) {
  const others = TOOLS.filter((t) => t.key !== current)
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4">
      <div className="border-t pt-6">
        <p className="mb-3 text-sm font-medium text-muted-foreground">More free, private tools</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {others.map((t) => (
            <a key={t.key} href={t.url} target="_blank" rel="noopener noreferrer"
               className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${t.gradient} text-white shadow`}>
                <t.Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 font-medium">{t.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </p>
                <p className="truncate text-sm text-muted-foreground">{t.blurb}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
