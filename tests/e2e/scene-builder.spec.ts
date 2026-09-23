/**
 * Scene Builder autenticado. Solo corre contra un proyecto de test aislado.
 * No hay UI de borrar proyecto: el E2E de duplicar exige
 * E2E_ALLOW_PROJECT_MUTATIONS + service role para eliminar el clon.
 */
import { expect, test, type Page } from '@playwright/test'
import {
  deleteClonedProject,
  deleteSceneById,
  deleteUploadedAsset,
  restoreSceneIds,
  sceneRowIds,
} from './helpers/builder-cleanup'
import { canCleanupClonedProject, requireIsolatedE2E } from './helpers/isolated-env'

const FIXTURE_IMAGE = 'tests/e2e/fixtures/e2e-pixel.png'

function isolated() {
  return requireIsolatedE2E()
}

async function login(page: Page) {
  const { email, password } = isolated()
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: /Iniciar sesión/i }).click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 })
}

async function openFixtureEditor(page: Page) {
  const { projectId } = isolated()
  await page.goto(`/admin/projects/${projectId}/edit`)
  await expect(page.getByRole('button', { name: 'Agregar escena' })).toBeVisible({ timeout: 20_000 })
}

async function addCatalogScene(page: Page, sceneType: 'message' | 'photoOrbit') {
  await page.getByRole('button', { name: 'Agregar escena' }).click()
  await expect(page.getByTestId('scene-catalog')).toBeVisible()
  await page.getByTestId(`scene-catalog-${sceneType}`).click()
}

async function waitForAutosave(page: Page) {
  await expect(page.getByText(/Guardado/i).first()).toBeVisible({ timeout: 15_000 })
}

test.describe('Scene Builder autenticado (entorno aislado)', () => {
  test.beforeAll(() => {
    requireIsolatedE2E()
  })

  test('agregar, duplicar, desactivar y eliminar escena deja el proyecto intacto', async ({
    page,
  }) => {
    await login(page)
    await openFixtureEditor(page)

    const initialIds = await sceneRowIds(page)
    const createdIds: string[] = []

    try {
      await addCatalogScene(page, 'message')
      await expect(page.getByText('Escena añadida')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Mensaje' }).first()).toBeVisible()

      const afterAdd = await sceneRowIds(page)
      const added = afterAdd.filter((id) => !initialIds.includes(id))
      expect(added, 'Debe existir exactamente una escena nueva').toHaveLength(1)
      createdIds.push(...added)

      const originalId = added[0]
      await page.getByTestId(`scene-menu-${originalId}`).click({ force: true })
      await page.getByRole('menuitem', { name: 'Duplicar' }).click()
      await expect(page.getByText('Escena duplicada')).toBeVisible()

      const afterDup = await sceneRowIds(page)
      const copies = afterDup.filter((id) => !initialIds.includes(id) && id !== originalId)
      expect(copies, 'Debe existir una copia de la escena').toHaveLength(1)
      createdIds.push(...copies)

      const copyId = copies[0]
      await page.getByTestId(`scene-menu-${copyId}`).click({ force: true })
      await page.getByRole('menuitem', { name: 'Desactivar' }).click()
      await expect(page.getByTestId(`scene-row-${copyId}`)).toContainText('Inactiva')

      await deleteSceneById(page, copyId)
      createdIds.splice(createdIds.indexOf(copyId), 1)

      await deleteSceneById(page, originalId)
      createdIds.splice(createdIds.indexOf(originalId), 1)

      await expect.poll(() => sceneRowIds(page)).toEqual(initialIds)
    } finally {
      await restoreSceneIds(page, createdIds)
    }
  })

  test('reordenar con teclado persiste tras recargar y restaura el orden', async ({ page }) => {
    await login(page)
    await openFixtureEditor(page)

    const initialIds = await sceneRowIds(page)
    expect(initialIds.length, 'El fixture debe tener al menos 2 escenas').toBeGreaterThanOrEqual(2)

    try {
      const firstHandle = page.getByTestId(`scene-drag-${initialIds[0]}`)
      await firstHandle.focus()
      await page.keyboard.press('Space')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Space')

      await expect.poll(async () => sceneRowIds(page)).not.toEqual(initialIds)
      const reordered = await sceneRowIds(page)
      expect(reordered[1]).toBe(initialIds[0])

      await page.reload()
      await expect(page.getByRole('button', { name: 'Agregar escena' })).toBeVisible()
      await expect.poll(() => sceneRowIds(page)).toEqual(reordered)

      const movedHandle = page.getByTestId(`scene-drag-${initialIds[0]}`)
      await movedHandle.focus()
      await page.keyboard.press('Space')
      await page.keyboard.press('ArrowUp')
      await page.keyboard.press('Space')

      await page.reload()
      await expect(page.getByRole('button', { name: 'Agregar escena' })).toBeVisible()
      await expect.poll(() => sceneRowIds(page)).toEqual(initialIds)
    } finally {
      const current = await sceneRowIds(page)
      if (current.join() !== initialIds.join()) {
        const handle = page.getByTestId(`scene-drag-${initialIds[0]}`)
        if (await handle.count()) {
          await handle.focus()
          await page.keyboard.press('Space')
          await page.keyboard.press('ArrowUp')
          await page.keyboard.press('Space')
        }
      }
    }
  })

  test('reordenar con puntero persiste y restaura el orden', async ({ page }) => {
    await login(page)
    await openFixtureEditor(page)

    const initialIds = await sceneRowIds(page)
    expect(initialIds.length).toBeGreaterThanOrEqual(2)

    try {
      const source = page.getByTestId(`scene-drag-${initialIds[0]}`)
      const target = page.getByTestId(`scene-drag-${initialIds[1]}`)
      await source.dragTo(target)

      await expect.poll(async () => sceneRowIds(page)).not.toEqual(initialIds)
      const reordered = await sceneRowIds(page)

      await page.reload()
      await expect(page.getByRole('button', { name: 'Agregar escena' })).toBeVisible()
      await expect.poll(() => sceneRowIds(page)).toEqual(reordered)

      const moved = page.getByTestId(`scene-drag-${reordered[0]}`)
      const originalFirst = page.getByTestId(`scene-drag-${initialIds[0]}`)
      await moved.dragTo(originalFirst)

      await page.reload()
      await expect(page.getByRole('button', { name: 'Agregar escena' })).toBeVisible()
      await expect.poll(() => sceneRowIds(page)).toEqual(initialIds)
    } finally {
      const current = await sceneRowIds(page)
      if (current.join() !== initialIds.join()) {
        const handle = page.getByTestId(`scene-drag-${initialIds[0]}`)
        if (await handle.count()) {
          await handle.focus()
          await page.keyboard.press('Space')
          await page.keyboard.press('ArrowUp')
          await page.keyboard.press('Space')
        }
      }
    }
  })

  test('MediaPicker selecciona un asset de prueba, persiste y limpia', async ({ page }) => {
    await login(page)
    await openFixtureEditor(page)

    const initialIds = await sceneRowIds(page)
    let createdSceneId = ''
    let uploadedAssetId = ''

    try {
      await addCatalogScene(page, 'photoOrbit')
      await expect(page.getByText('Escena añadida')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Órbita de Fotos' }).first()).toBeVisible()

      const afterAdd = await sceneRowIds(page)
      const added = afterAdd.filter((id) => !initialIds.includes(id))
      expect(added).toHaveLength(1)
      createdSceneId = added[0]

      await page.getByTestId('open-media-picker').click()
      await expect(page.getByTestId('media-picker')).toBeVisible()

      const fileInput = page.locator('input[type="file"][id^="file-upload-"]')
      await fileInput.setInputFiles(FIXTURE_IMAGE)

      await page.getByLabel('Buscar en biblioteca').fill('e2e-pixel')
      const selectButton = page.locator('[data-testid^="media-select-"]').first()
      await expect(selectButton).toBeVisible({ timeout: 20_000 })
      uploadedAssetId = (await selectButton.getAttribute('data-testid'))?.replace('media-select-', '') ?? ''
      expect(uploadedAssetId).toBeTruthy()

      await selectButton.click({ force: true })
      await page.getByTestId('media-picker-confirm').click()
      await expect(page.getByTestId('gallery-field').locator('img').first()).toBeVisible()
      await waitForAutosave(page)

      await page.reload()
      await expect(page.getByRole('button', { name: 'Agregar escena' })).toBeVisible()
      await page.getByTestId(`scene-row-${createdSceneId}`).click()
      await expect(page.getByTestId('gallery-field').locator('img').first()).toBeVisible()
    } finally {
      if (createdSceneId) {
        await restoreSceneIds(page, [createdSceneId])
      }
      if (uploadedAssetId) {
        try {
          await deleteUploadedAsset(page, uploadedAssetId)
        } catch {
          // Best-effort: no dejar el fallo de cleanup por encima de la aserción original.
        }
      }
    }
  })

  test('duplicar proyecto crea un borrador independiente y lo elimina', async ({ page }) => {
    const config = isolated()
    test.skip(
      !(config.allowProjectMutations && canCleanupClonedProject()),
      'Project duplication E2E requires E2E_ALLOW_PROJECT_MUTATIONS=1 and SUPABASE_SERVICE_ROLE_KEY so the clone can be deleted. The app has no project-delete UI.',
    )

    await login(page)
    await page.goto('/admin')
    await expect(page.getByLabel('Buscar experiencias')).toBeVisible()

    const stamp = Date.now()
    const uniqueName = `e2e-builder-${stamp}`
    const uniqueSlug = `e2e-builder-${stamp}`
    let cloneId = ''
    let cleanupError: unknown

    try {
      await page.getByLabel('Buscar experiencias').fill(config.projectSlug)
      await expect(page.getByText(`/p/${config.projectSlug}`)).toBeVisible()

      await page.getByRole('button', { name: 'Más acciones' }).first().click()
      await page.getByTestId(`duplicate-project-${config.projectId}`).click()

      const dialog = page.getByTestId('duplicate-project-dialog')
      await expect(dialog).toBeVisible()
      await dialog.locator('#duplicate-name').fill(uniqueName)
      await dialog.locator('#duplicate-slug').fill(uniqueSlug)
      await page.getByTestId('duplicate-project-confirm').click()

      await expect(page).toHaveURL(/\/admin\/projects\/.+\/edit/, { timeout: 20_000 })
      cloneId = page.url().match(/\/admin\/projects\/([^/]+)\/edit/)?.[1] ?? ''
      expect(cloneId).toBeTruthy()
      expect(cloneId).not.toBe(config.projectId)

      await expect(page.getByText('Borrador').first()).toBeVisible()
      const clonedIds = await sceneRowIds(page)
      expect(clonedIds.length).toBeGreaterThan(0)

      await page.goto('/admin')
      await page.getByLabel('Buscar experiencias').fill(uniqueName)
      await expect(page.getByText(uniqueName)).toBeVisible()
      await expect(page.getByText(`/p/${uniqueSlug}`)).toBeVisible()
      await expect(page.getByText('Borrador').first()).toBeVisible()
    } finally {
      if (cloneId) {
        try {
          await deleteClonedProject(cloneId, config.projectId)
        } catch (error) {
          cleanupError = error
        }
      }
    }

    if (cleanupError) {
      throw cleanupError
    }
  })
})
