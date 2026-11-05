import { asset } from '@/lib/asset'
import { DOETRA, PAGES } from '@/lib/site'
import { TOOLS } from '@/components/MoreTools'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  )
}

/** Doetra footer: who makes this, the upscaler pages, sibling tools, social. */
export function SiteFooter() {
  const siblings = TOOLS.filter((t) => t.key !== 'embiggen' && t.url.startsWith('https://doetra.com')).slice(0, 7)
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href={DOETRA.home} aria-label="Doetra home" className="inline-flex items-center gap-2.5">
              <img src={asset('/doetra-mark.png')} alt="" width={34} height={34} className="h-[34px] w-[34px]" />
              <span className="flex flex-col leading-none">
                <b className="text-[18px] font-extrabold tracking-[-0.03em]">Doetra</b>
                <small className="mt-[3px] text-[11.5px] font-semibold text-muted-foreground">Embiggen · Image upscaler</small>
              </span>
            </a>
            <p className="mt-3.5 max-w-[34ch] text-[14px] leading-relaxed text-muted-foreground">Embiggen is a free tool by Doetra. Free, private tools that run in your browser, and an AI writer for SEO articles.</p>
            <a href={DOETRA.app} className="mt-4 inline-flex h-[42px] items-center gap-2 rounded-xl px-3.5 text-[14px] font-semibold shadow-[inset_0_0_0_1px_hsl(var(--border))] transition-colors hover:bg-muted">
              Try Doetra AI Writer <span aria-hidden>→</span>
            </a>
          </div>
          <div>
            <h3 className="mb-3 text-[13px] font-bold">Upscaler pages</h3>
            <ul className="space-y-2 text-[14px] text-muted-foreground">
              {PAGES.map((p) => (
                <li key={p.slug}>
                  <a href={asset(p.slug ? `/${p.slug}` : '/')} className="transition-colors hover:text-foreground">
                    {p.nav}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-[13px] font-bold">More free tools</h3>
            <ul className="space-y-2 text-[14px] text-muted-foreground">
              {siblings.map((t) => (
                <li key={t.key}>
                  <a href={t.url} className="transition-colors hover:text-foreground">
                    {t.blurb}
                  </a>
                </li>
              ))}
              <li>
                <a href={DOETRA.tools} className="font-semibold text-foreground/80 transition-colors hover:text-foreground">
                  All free tools →
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-[13px] font-bold">Doetra</h3>
            <ul className="space-y-2 text-[14px] text-muted-foreground">
              {[
                { label: 'Doetra AI Writer', href: DOETRA.app },
                { label: 'Blog', href: DOETRA.blog },
                { label: 'Privacy Policy', href: DOETRA.privacy },
                { label: 'Terms of Service', href: DOETRA.terms },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="transition-colors hover:text-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t pt-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Doetra ·{' '}
            <a href={`mailto:${DOETRA.email}`} className="hover:text-foreground">
              {DOETRA.email}
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a href={DOETRA.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Doetra on LinkedIn" className="transition-colors hover:text-foreground">
              <LinkedinIcon className="h-5 w-5" />
            </a>
            <a href={DOETRA.facebook} target="_blank" rel="noopener noreferrer" aria-label="Doetra on Facebook" className="transition-colors hover:text-foreground">
              <FacebookIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
