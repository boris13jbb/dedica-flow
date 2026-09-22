const PRODUCTION_APP_URL = 'https://workspace-theta-mocha.vercel.app'

/**
 * URL base de la app para enlaces públicos y metadatos.
 * Prioriza NEXT_PUBLIC_APP_URL; en Vercel usa VERCEL_URL como respaldo.
 */
export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (configured) return configured

  const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, '')
  if (vercelUrl) return `https://${vercelUrl}`

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_APP_URL
  }

  return 'http://localhost:3000'
}

export function getPublicExperienceUrl(slug: string) {
  const cleanSlug = slug.trim()
  return `${getAppUrl()}/p/${encodeURIComponent(cleanSlug)}`
}
