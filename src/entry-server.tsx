/* eslint-disable react-refresh/only-export-components -- build-time entry, never hot-reloaded */
import { renderToString } from 'react-dom/server'
import App from './App'
import { PAGES, jsonLd, urlFor, type Slug, type EDITOR_SLUG } from '@/lib/site'

/** Used at build time only: the HTML for every page. */
export function render(slug: Slug | typeof EDITOR_SLUG) {
  return { html: renderToString(<App initialSlug={slug} />) }
}

export { PAGES, jsonLd, urlFor }
