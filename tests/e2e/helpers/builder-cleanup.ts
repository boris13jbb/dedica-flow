import { expect, type Page } from '@playwright/test'
import { canCleanupClonedProject } from './isolated-env'

export async function sceneRowIds(page: Page): Promise<string[]> {
  return page.locator('[data-testid^="scene-row-"]').evaluateAll((els) =>
    els
      .map((el) => el.getAttribute('data-testid')?.replace('scene-row-', '') ?? '')
      .filter(Boolean),
  )
}

export async function deleteSceneById(page: Page, sceneId: string) {
  const row = page.getByTestId(`scene-row-${sceneId}`)
  if ((await row.count()) === 0) return

  await page.getByTestId(`scene-menu-${sceneId}`).click({ force: true })
  await page.getByRole('menuitem', { name: 'Eliminar' }).click()
  await page.getByRole('button', { name: 'Eliminar' }).click()
  await expect(row).toHaveCount(0, { timeout: 15_000 })
}

export async function restoreSceneIds(page: Page, leftoverIds: string[]) {
  for (const sceneId of leftoverIds) {
    try {
      await deleteSceneById(page, sceneId)
    } catch {
      // Best-effort cleanup: the assertion that failed already reports the real error.
    }
  }
}

export async function deleteUploadedAsset(page: Page, assetId: string) {
  if (!assetId) return
  const response = await page.request.delete(`/api/media/${assetId}`)
  if (!response.ok()) {
    throw new Error(`Cleanup de media falló (${response.status()})`)
  }
}

/**
 * Elimina un proyecto clonado de prueba vía REST admin.
 * Solo se usa cuando existe service role y el id no coincide con el proyecto fixture.
 */
export async function deleteClonedProject(cloneId: string, fixtureProjectId: string) {
  if (!canCleanupClonedProject()) {
    throw new Error('No hay service role para limpiar el proyecto clonado.')
  }
  if (!cloneId || cloneId === fixtureProjectId) {
    throw new Error('Cleanup de duplicado rechazado: id inválido o coincide con el fixture.')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: 'return=minimal',
  }

  const scenes = await fetch(`${url}/rest/v1/scenes?project_id=eq.${cloneId}`, {
    method: 'DELETE',
    headers,
  })
  if (!scenes.ok) {
    throw new Error(`Cleanup de escenas del clon falló (${scenes.status})`)
  }

  const project = await fetch(`${url}/rest/v1/projects?id=eq.${cloneId}`, {
    method: 'DELETE',
    headers,
  })
  if (!project.ok) {
    throw new Error(`Cleanup del proyecto clonado falló (${project.status})`)
  }
}
