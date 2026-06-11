import { Wand2, Captions, Sparkles, Maximize2, AudioLines, ArrowUpRight, type LucideIcon } from 'lucide-react'

type ToolKey = 'poof' | 'capsy' | 'vanish' | 'embiggen' | 'aloud'

// Single source of truth for the whole tool family. Add new tools here and the
// compact pill row scales without the footer growing tall.
const TOOLS: { key: ToolKey; name: string; blurb: string; url: string; Icon: LucideIcon; gradient: string }[] = [
  { key: 'poof', name: 'Poof', blurb: 'Remove image backgrounds', url: 'https://poof-eight.vercel.app', Icon: Wand2, gradient: 'from-violet-500 to-fuchsia-500' },
  { key: 'capsy', name: 'Capsy', blurb: 'Auto-caption your videos', url: 'https://capsy-two.vercel.app', Icon: Captions, gradient: 'from-teal-500 to-cyan-500' },
  { key: 'vanish', name: 'Vanish', blurb: 'Erase objects from photos', url: 'https://vanish-bice.vercel.app', Icon: Sparkles, gradient: 'from-fuchsia-500 to-pink-500' },
  { key: 'embiggen', name: 'Embiggen', blurb: 'Upscale any image', url: 'https://embiggen.vercel.app', Icon: Maximize2, gradient: 'from-indigo-500 to-violet-500' },
  { key: 'aloud', name: 'Aloud', blurb: 'Read anything out loud', url: 'https://aloud-eta.vercel.app', Icon: AudioLines, gradient: 'from-amber-500 to-rose-500' },
]

export function MoreTools({ current }: { current: ToolKey }) {
  const others = TOOLS.filter((t) => t.key !== current)
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-10 pt-8">
      <div className="border-t pt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          More free, private tools
        </p>
        {/* Compact pills wrap onto as few lines as possible — stays small as the family grows. */}
        <div className="flex flex-wrap gap-2">
          {others.map((t) => (
            <a
              key={t.key}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              title={t.blurb}
              className="group inline-flex items-center gap-2 rounded-full border bg-card/70 py-1 pl-1.5 pr-3 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-accent hover:shadow"
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-white`}>
                <t.Icon className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-foreground">{t.name}</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
