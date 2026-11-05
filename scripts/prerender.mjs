// After `vite build` (client) and `vite build --ssr` (server), write one real HTML file per page:
// the rendered page inside #root, plus title, description, canonical, social card and JSON-LD.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve('dist/image-upscaler')
const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
const { render, PAGES, jsonLd, urlFor } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const OG = 'https://doetra.com/image-upscaler/og.png'

for (const p of PAGES) {
  const url = urlFor(p.slug)
  const head = [
    `<meta name="description" content="${esc(p.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Doetra" />`,
    `<meta property="og:title" content="${esc(p.title)}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Embiggen — free AI image upscaler by Doetra" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(p.title)}" />`,
    `<meta name="twitter:description" content="${esc(p.description)}" />`,
    `<meta name="twitter:image" content="${OG}" />`,
    ...jsonLd(p).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\u003c')}</script>`),
  ].join('\n    ')
  const { html } = render(p.slug)
  const out = template
    .replace('<!--head-->', head)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace('<!--app-->', html)
  const dir = p.slug ? path.join(root, p.slug) : root
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), out)
  console.log(`prerendered /${p.slug || ''} (${(out.length / 1024).toFixed(0)} KB)`)
}
// the editor: its own HTML so a reload or a shared link works, kept out of search results
{
  const head = [`<meta name="robots" content="noindex, follow" />`, `<link rel="canonical" href="${urlFor('')}" />`].join(' ')
  const out = template
    .replace('<!--head-->', head)
    .replace(/<title>[^<]*<\/title>/, '<title>Upscaler — Embiggen, a free tool by Doetra</title>')
    .replace('<!--app-->', render('editor').html)
  fs.mkdirSync(path.join(root, 'editor'), { recursive: true })
  fs.writeFileSync(path.join(root, 'editor', 'index.html'), out)
  console.log('prerendered /editor (noindex)')
}
fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true })
