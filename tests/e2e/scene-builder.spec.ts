import { expect, test } from '@playwright/test'

const email = process.env.E2E_EMAIL
const password = process.env.E2E_PASSWORD
const hasAuth = Boolean(email && password)

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(email as string)
  await page.getByLabel('Contraseña').fill(password as string)
  await page.getByRole('button', { name: /Iniciar sesión/i }).click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 })
}

test.describe('Scene Builder V2', () => {
  test.skip(!hasAuth, 'Requiere E2E_EMAIL y E2E_PASSWORD; no publica en producción')

  test('agregar, duplicar, desactivar y eliminar escena', async ({ page }) => {
    await login(page)

    await page.getByRole('link', { name: /Escenas/i }).first().click()
    await expect(page.getByTestId('add-scene-button')).toBeVisible({ timeout: 20_000 })

    const initialCount = await page.getByTestId(/scene-row-/).count()

    await page.getByTestId('add-scene-button').click()
    await expect(page.getByTestId('scene-catalog')).toBeVisible()
    await page.getByTestId('scene-catalog-message').click()
    await expect(page.getByTestId('scene-catalog')).toHaveCount(0)

    await expect(page.getByTestId(/scene-row-/)).toHaveCount(initialCount + 1)

    const newest = page.getByTestId(/scene-menu-/).last()
    await newest.click()
    await page.getByRole('menuitem', { name: 'Duplicar' }).click()
    await expect(page.getByTestId(/scene-row-/)).toHaveCount(initialCount + 2)

    const copyMenu = page.getByTestId(/scene-menu-/).last()
    await copyMenu.click()
    await page.getByRole('menuitem', { name: 'Desactivar' }).click()
    await expect(page.getByText('Inactiva').last()).toBeVisible()

    await copyMenu.click()
    await page.getByRole('menuitem', { name: 'Eliminar' }).click()
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByTestId(/scene-row-/)).toHaveCount(initialCount + 1)
  })

  test('MediaPicker actualiza Photo Orbit desde Biblioteca', async ({ page }) => {
    await login(page)
    await page.getByRole('link', { name: /Escenas/i }).first().click()
    await expect(page.getByTestId('add-scene-button')).toBeVisible({ timeout: 20_000 })

    await page.getByTestId('add-scene-button').click()
    await page.getByTestId('scene-catalog-photoOrbit').click()
    await expect(page.getByTestId('gallery-field')).toBeVisible()

    await page.getByTestId('open-media-picker').click()
    await expect(page.getByTestId('media-picker')).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByTestId('media-picker')).toHaveCount(0)
  })

  test('duplicar proyecto desde el dashboard', async ({ page }) => {
    await login(page)
    await expect(page.getByText('/p/')).toBeVisible({ timeout: 20_000 })

    const firstMenu = page.getByLabel('Más acciones').first()
    await firstMenu.click()
    await page.getByRole('menuitem', { name: 'Duplicar' }).click()
    await expect(page.getByTestId('duplicate-project-dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByTestId('duplicate-project-dialog')).toHaveCount(0)
  })
})
