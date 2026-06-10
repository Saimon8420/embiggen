export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export type ValidationResult = { ok: true } | { ok: false; reason: string }

export function validateFile(file: File): ValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, reason: 'Unsupported file type. Use PNG, JPG, or WebP.' }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, reason: 'File is too large (max 10 MB).' }
  }
  return { ok: true }
}
