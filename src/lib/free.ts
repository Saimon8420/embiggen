// "Pro features, free": what upscalers usually charge for, and what Embiggen gives away.
// No company names — only what is usually paid and a typical price.

export interface FreeItem {
  feature: string
  detail?: string
  usually: string
}

export const FREE_TITLE = 'Pro features, free'
export const FREE_INTRO = 'What AI upscalers put behind credits or a paid plan — included here, with no account and no watermark.'
export const FREE_NOTE = 'Prices are typical of popular upscalers in 2026. The AI runs on your device, so it costs nothing to give away.'

export const FREE: FreeItem[] = [
  { feature: '4× upscaling', usually: 'Free plans stop at 2×' },
  { feature: 'Full-resolution download', detail: 'up to 8192 px', usually: 'Free: preview size only' },
  { feature: 'No watermark', usually: 'Watermark on free images' },
  { feature: 'No credits', detail: 'as many images as you like', usually: '3–10 credits a month, then $9–20/mo' },
  { feature: 'Exact output size', detail: 'type the pixels you need', usually: 'Pro feature' },
  { feature: 'Nothing uploaded', detail: 'the photo stays on your device', usually: 'Your photo goes to their servers' },
]

export const FREE_PILLS = ['4×', 'Full resolution', 'No watermark', 'No credits', 'Exact size', 'Nothing uploaded']
