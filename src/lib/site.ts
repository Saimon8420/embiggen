// Every page Embiggen serves. Each is pre-rendered to its own HTML at build time,
// so search engines read the headline, steps and questions without JavaScript.

export const ORIGIN = 'https://doetra.com'
export const BASE = '/image-upscaler'
export const EDITOR_SLUG = 'editor'

export const DOETRA = {
  home: 'https://doetra.com',
  tools: 'https://doetra.com/free-tools/',
  app: 'https://app.doetra.com',
  blog: 'https://doetra.com/blog',
  privacy: 'https://doetra.com/privacy',
  terms: 'https://doetra.com/terms',
  email: 'contact@doetra.com',
  linkedin: 'https://www.linkedin.com/company/doetra-ai/',
  facebook: 'https://www.facebook.com/doetra',
}

export interface Faq {
  q: string
  a: string
}

export type Slug = '' | 'increase-image-resolution' | 'upscale-image-4x'

export interface PageDef {
  slug: Slug
  nav: string
  title: string
  description: string
  kicker: string
  h1: string
  em: string
  lede: string
  scale: '2x' | '4x'
  steps: string[]
  faqs: Faq[]
}

const COMMON: Faq[] = [
  { q: 'Is it really free? Is there a watermark?', a: 'Yes, it is free with no watermark, no credits and no sign-up. The AI runs on your own device, so there is no per-image server cost to pass on. Embiggen is a free tool by Doetra.' },
  { q: 'Is my photo uploaded?', a: 'No. The AI model is downloaded to your browser once (about 5 MB) and every image is enlarged on your device. Nothing is sent to a server.' },
  { q: 'How big can the result be?', a: 'Up to 8192 px on the long side. Very large photos are first scaled to 2048 px (upscaling a 20-megapixel photo adds nothing), then enlarged.' },
  { q: 'How long does it take?', a: 'A few seconds for a small image; 4× on a 1000 px photo takes about half a minute on a laptop. The picture is processed in tiles so your browser stays responsive.' },
]

export const PAGES: PageDef[] = [
  {
    slug: '',
    nav: 'AI image upscaler',
    title: 'AI Image Upscaler Free — Enlarge Photos 2× or 4×, No Watermark | Doetra',
    description: 'Upscale images free with AI: enlarge a photo 2× or 4× and sharpen it, at full resolution, with no watermark and no credits. Runs on your device — nothing uploaded.',
    kicker: 'Free · full resolution · nothing uploaded',
    h1: 'Make small images',
    em: 'big and sharp.',
    lede: 'Enlarge a photo 2× or 4× with AI super-resolution — edges stay crisp instead of going soft and blocky. Full-resolution download, no watermark, no credits, nothing uploaded.',
    scale: '2x',
    steps: ['Drop a photo, screenshot or graphic.', 'Pick 2×, 4× or an exact size, then Upscale. Drag the divider to compare.', 'Download PNG, JPG or WebP at full resolution.'],
    faqs: [
      { q: 'What does an AI upscaler do that normal resizing doesn’t?', a: 'Normal resizing stretches pixels, so edges blur and blocks appear. The AI has learned what sharp detail looks like and draws it in, so text, edges and textures stay crisp at 2× and 4×.' },
      ...COMMON,
    ],
  },
  {
    slug: 'increase-image-resolution',
    nav: 'Increase resolution',
    title: 'Increase Image Resolution Free — Turn Low-Res Into HD | Doetra',
    description: 'Increase the resolution of a low-quality image free: AI turns a small, blurry picture into a sharp HD one. Pick an exact size in pixels. No watermark, nothing uploaded.',
    kicker: 'Low-res → HD',
    h1: 'Low-res in,',
    em: 'HD out.',
    lede: 'A tiny logo, an old profile picture, a screenshot that looks soft — give it more pixels and real detail. Pick 2×, 4× or the exact width you need.',
    scale: '2x',
    steps: ['Drop the low-resolution image.', 'Choose 2×, 4×, or type the size you need (e.g. 1920 px wide).', 'Download the HD version.'],
    faqs: [
      { q: 'Can I set an exact size?', a: 'Yes. Choose “Size” and type the long side in pixels — Embiggen runs the AI, then fits the result to exactly that size.' },
      ...COMMON,
    ],
  },
  {
    slug: 'upscale-image-4x',
    nav: 'Upscale 4×',
    title: 'Upscale Image 4× Free — AI Super-Resolution in Your Browser | Doetra',
    description: 'Upscale an image 4× free: 500 px becomes 2000 px with AI-drawn detail, at full resolution. No watermark, no credits, no upload.',
    kicker: '4× super-resolution',
    h1: 'Four times bigger,',
    em: 'still sharp.',
    lede: 'Turn a 500 px image into 2000 px. The AI draws in real detail instead of stretching pixels — and the full 4× file is yours, no paid plan needed.',
    scale: '4x',
    steps: ['Drop the image.', '4× is already picked — hit Upscale.', 'Download the full-resolution result.'],
    faqs: [
      { q: 'Do other upscalers charge for 4×?', a: 'Often. Free plans usually stop at 2×, cap the output size or add a watermark. Here 4× at full resolution is free.' },
      ...COMMON,
    ],
  },
]

export const urlFor = (slug: string) => `${ORIGIN}${BASE}${slug ? `/${slug}` : ''}`

export function slugFromPath(pathname: string): Slug | typeof EDITOR_SLUG {
  const rest = pathname.replace(/\/+$/, '').split(BASE)[1]?.replace(/^\//, '') ?? ''
  if (rest === EDITOR_SLUG) return EDITOR_SLUG
  return (PAGES.find((p) => p.slug === rest)?.slug ?? '') as Slug
}

export function jsonLd(p: PageDef): object[] {
  const url = urlFor(p.slug)
  const out: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: p.slug ? `Embiggen — ${p.nav}` : 'Embiggen — free AI image upscaler',
      url,
      description: p.description,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any (web browser)',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: 'Doetra', url: DOETRA.home },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `${p.h1} ${p.em}`,
      step: p.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]
  if (p.slug)
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Embiggen', item: urlFor('') },
        { '@type': 'ListItem', position: 2, name: p.nav, item: url },
      ],
    })
  return out
}
