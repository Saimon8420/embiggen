/**
 * URL for a file in public/ (or a page) under the app's base path.
 * import.meta.env.BASE_URL is whatever `base` is set to in vite.config.ts, with a
 * trailing slash. Paths written as plain "/x" would point at doetra.com's root (WordPress).
 */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
