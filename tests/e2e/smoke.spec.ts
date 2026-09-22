import { expect, test } from '@playwright/test'

test.describe('DedicaFlow smoke', () => {
  test('login page loads DedicaFlow branding and form', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    await page.goto('/login')

    await expect(page).toHaveTitle(/DedicaFlow/i)
    await expect(page.getByRole('heading', { name: 'DedicaFlow' })).toBeVisible()
    await expect(page.getByLabel('Correo electrónico')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: /Iniciar sesión/i })).toBeVisible()

    expect(pageErrors, `Errores JS en /login: ${pageErrors.join(' | ')}`).toEqual([])
  })

  test('admin redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'DedicaFlow' })).toBeVisible()
  })
})

test.describe('DedicaFlow smoke mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('login remains usable on mobile viewport', async ({ page }) => {
    await page.goto('/login')

    const card = page.locator('form').first()
    await expect(page.getByRole('heading', { name: 'DedicaFlow' })).toBeVisible()
    await expect(card).toBeVisible()

    const box = await card.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThan(200)
    expect(box!.width).toBeLessThanOrEqual(390)

    await expect(page.getByRole('button', { name: /Iniciar sesión/i })).toBeVisible()
  })
})
