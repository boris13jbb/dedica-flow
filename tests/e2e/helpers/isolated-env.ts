/**
 * Guardas para E2E autenticados. Nunca escriben valores de secretos.
 * Rechazan proyectos de producción conocidos (p. ej. Mayrita).
 */

const FORBIDDEN_PROJECT_SLUGS = new Set(['mayrita'])

export type IsolatedE2EConfig = {
  email: string
  password: string
  projectId: string
  projectSlug: string
  allowProjectMutations: boolean
}

export function requireIsolatedE2E(): IsolatedE2EConfig {
  const isolated = process.env.E2E_ISOLATED === '1' || process.env.E2E_ISOLATED === 'true'
  if (!isolated) {
    throw new Error(
      'Authenticated E2E requires isolated test environment. Set E2E_ISOLATED=1 against a dedicated test/staging backend. Do not run destructive Builder E2E on production.',
    )
  }

  const email = process.env.E2E_EMAIL?.trim()
  const password = process.env.E2E_PASSWORD
  const projectId = process.env.E2E_PROJECT_ID?.trim()
  const projectSlug = process.env.E2E_PROJECT_SLUG?.trim().toLowerCase()

  if (!email || !password || !projectId || !projectSlug) {
    throw new Error(
      'Authenticated E2E requires E2E_EMAIL, E2E_PASSWORD, E2E_PROJECT_ID and E2E_PROJECT_SLUG. Values must never be committed.',
    )
  }

  if (FORBIDDEN_PROJECT_SLUGS.has(projectSlug)) {
    throw new Error(
      'Authenticated E2E refuses known production project slugs. Use a dedicated test project.',
    )
  }

  return {
    email,
    password,
    projectId,
    projectSlug,
    allowProjectMutations:
      process.env.E2E_ALLOW_PROJECT_MUTATIONS === '1' ||
      process.env.E2E_ALLOW_PROJECT_MUTATIONS === 'true',
  }
}

export function canCleanupClonedProject(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}
