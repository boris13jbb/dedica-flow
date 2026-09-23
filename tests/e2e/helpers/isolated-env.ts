/**
 * Guardas para E2E autenticados. Nunca escriben valores de secretos.
 * Rechazan proyectos de producción conocidos (p. ej. Mayrita).
 */

const FORBIDDEN_PROJECT_SLUGS = new Set(['mayrita'])
const FORBIDDEN_SUPABASE_HOSTS = new Set(['cyfwvhqexazlmcifyskb.supabase.co'])

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

  const serviceRole =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.E2E_SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRole) {
    throw new Error(
      'Authenticated E2E requires isolated E2E_SUPABASE_SERVICE_ROLE_KEY (server-only, dedica-flow-e2e). Do not use the production key.',
    )
  }

  if (Object.keys(process.env).some((key) => key.startsWith('NEXT_PUBLIC_') && key.includes('SERVICE'))) {
    throw new Error('Authenticated E2E refuses NEXT_PUBLIC_ server credentials.')
  }

  if (FORBIDDEN_PROJECT_SLUGS.has(projectSlug)) {
    throw new Error(
      'Authenticated E2E refuses known production project slugs. Use a dedicated test project.',
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (supabaseUrl) {
    try {
      const host = new URL(supabaseUrl).hostname.toLowerCase()
      if (FORBIDDEN_SUPABASE_HOSTS.has(host)) {
        throw new Error(
          'Authenticated E2E refuses the production Supabase host. Point NEXT_PUBLIC_SUPABASE_URL at the isolated E2E project.',
        )
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('refuses the production')) {
        throw error
      }
      throw new Error('Authenticated E2E requires a valid isolated NEXT_PUBLIC_SUPABASE_URL.')
    }
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
