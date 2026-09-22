/**
 * Normaliza slugs de URL pública (misma regla que al crear proyectos).
 */
export function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Decodifica y limpia el slug recibido en rutas dinámicas. */
export function normalizeSlugFromRoute(raw: string) {
  try {
    return decodeURIComponent(raw).trim()
  } catch {
    return raw.trim()
  }
}
