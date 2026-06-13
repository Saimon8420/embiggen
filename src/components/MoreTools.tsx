import { Wand2, Captions, Sparkles, Maximize2, AudioLines, AppWindow, Braces, SprayCan, Code2, ScanText, ArrowUpRight, type LucideIcon } from 'lucide-react'

type ToolKey = 'poof' | 'capsy' | 'vanish' | 'embiggen' | 'aloud' | 'tabby' | 'morph' | 'scrub' | 'snippy' | 'glean'

// Single source of truth for the whole tool family. Add new tools here.
const TOOLS: { key: ToolKey; name: string; blurb: string; url: string; Icon: LucideIcon; gradient: string }[] = [
  { key: 'poof', name: 'Poof', blurb: 'Remove image backgrounds', url: 'https://poof-eight.vercel.app', Icon: Wand2, gradient: 'from-violet-500 to-fuchsia-500' },
  { key: 'capsy', name: 'Capsy', blurb: 'Auto-caption your videos', url: 'https://capsy-two.vercel.app', Icon: Captions, gradient: 'from-teal-500 to-cyan-500' },
  { key: 'vanish', name: 'Vanish', blurb: 'Erase objects from photos', url: 'https://vanish-bice.vercel.app', Icon: Sparkles, gradient: 'from-fuchsia-500 to-pink-500' },
  { key: 'embiggen', name: 'Embiggen', blurb: 'Upscale any image', url: 'https://embiggen.vercel.app', Icon: Maximize2, gradient: 'from-indigo-500 to-violet-500' },
  { key: 'aloud', name: 'Aloud', blurb: 'Read anything out loud', url: 'https://aloud-eta.vercel.app', Icon: AudioLines, gradient: 'from-amber-500 to-rose-500' },
  { key: 'tabby', name: 'Tabby', blurb: 'Generate favicons', url: 'https://tabby-khaki.vercel.app', Icon: AppWindow, gradient: 'from-purple-500 to-indigo-500' },
  { key: 'morph', name: 'Morph', blurb: 'Convert JSON/CSV/YAML', url: 'https://morph-mu.vercel.app', Icon: Braces, gradient: 'from-sky-500 to-blue-500' },
  { key: 'scrub', name: 'Scrub', blurb: 'Strip photo metadata', url: 'https://scrub-delta.vercel.app', Icon: SprayCan, gradient: 'from-emerald-500 to-green-500' },
  { key: 'snippy', name: 'Snippy', blurb: 'Beautiful code images', url: 'https://snippy-xi.vercel.app', Icon: Code2, gradient: 'from-rose-500 to-orange-500' },
  { key: 'glean', name: 'Glean', blurb: 'Extract text from images', url: 'https://glean-three.vercel.app', Icon: ScanText, gradient: 'from-yellow-500 to-lime-500' },
]

export function MoreTools({ current }: { current: ToolKey }) {
  const others = TOOLS.filter((t) => t.key !== current)
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-10 pt-8">
      <div className="border-t pt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          More free, private tools
        </p>
        {/* Small screens: one horizontal, swipeable scroll row (edge-to-edge).
            Desktop (lg+): a neat grid that wraps as the family grows. */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] lg:mx-0 lg:grid lg:grid-cols-9 lg:overflow-visible lg:px-0 lg:pb-0">
          {others.map((t) => (
            <a
              key={t.key}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-[15rem] shrink-0 snap-start items-center gap-2.5 rounded-xl border bg-card/70 p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-accent hover:shadow lg:w-auto"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${t.gradient} text-white shadow`}>
                <t.Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-medium leading-tight">
                  {t.name}
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{t.blurb}</span>
              </span>
            </a>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Free · Private · In-browser AI</p>
      </div>
    </footer>
  )
}
