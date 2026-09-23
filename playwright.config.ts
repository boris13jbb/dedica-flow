import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import { requireIsolatedE2E } from './tests/e2e/helpers/isolated-env'

const PORT = 3100
const BASE_URL = `http://127.0.0.1:${PORT}`

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadLocalEnv()

/**
 * Por defecto solo corre smoke (sin auth destructiva).
 * Suite autenticada: npm run test:e2e:authenticated
 */
const suite =
  process.env.E2E_SUITE === 'authenticated' ||
  process.env.npm_lifecycle_event === 'test:e2e:authenticated'
    ? 'authenticated'
    : 'smoke'

if (suite === 'authenticated') {
  requireIsolatedE2E()
}

const smokeProjects = [
  {
    name: 'chromium',
    testMatch: /smoke\.spec\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'Mobile Chrome',
    testMatch: /smoke\.spec\.ts/,
    use: { ...devices['Pixel 5'] },
  },
]

const authenticatedProjects = [
  {
    name: 'authenticated',
    testMatch: /scene-builder\.spec\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
]

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: String(PORT),
    },
  },
  projects: suite === 'authenticated' ? authenticatedProjects : smokeProjects,
})
