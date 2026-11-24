import type { APIRequestContext, Locator, Page } from '@playwright/test'

import { expect, test } from './fixtures'

const EDITING_VERSION_KEY = 'apparaatti-filter-wording-version'
const SNAPSHOTS_PATH = '/api/admin/filter-config/snapshots'

let snapshotId: number

const createSnapshot = async (request: APIRequestContext, name: string): Promise<number> => {
  const response = await request.post(SNAPSHOTS_PATH, {
    data: { name, description: 'e2e', base: { kind: 'published' }, mutations: { wordings: [] } },
  })
  expect(response.status()).toBe(201)
  return (await response.json()).id
}

const openInEditMode = async (page: Page) => {
  await page.addInitScript(([key, id]) => window.localStorage.setItem(key, id), [
    EDITING_VERSION_KEY,
    String(snapshotId),
  ] as const)
  await page.goto('/')
  await expect(page.getByTestId('filter-edit-mode-overlay')).toBeVisible()
  await page.waitForLoadState('networkidle')
}

const openGear = async (page: Page) => {
  const gear = page.getByTestId('filter-settings-gear-lang')
  await expect(gear).toBeVisible()
  await gear.click()
  const dialog = page.getByTestId('filter-settings-dialog')
  await expect(dialog).toBeVisible()
  return dialog
}

const firstVariantName = async (request: APIRequestContext): Promise<string> => {
  const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const config = payload.filters.find((filter: { id: string }) => filter.id === 'lang')
  return config.variants[0].name
}

const openStructureTab = async (dialog: Locator) => {
  await dialog.getByRole('tab', { name: 'Rakenne (pääkäyttäjä)' }).click()
  await expect(dialog.getByRole('tab', { name: 'Rakenne (pääkäyttäjä)' })).toHaveAttribute('aria-selected', 'true')
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ request, e2eUserId }) => {
  snapshotId = await createSnapshot(request, `e2e-filter-gear-${e2eUserId}`)
})

test.afterAll(async ({ request }) => {
  await request.delete(`${SNAPSHOTS_PATH}/${snapshotId}`)
})

test('the gear opens on the basic tab and keeps the structure fields on the other one', async ({ page }) => {
  await openInEditMode(page)
  const dialog = await openGear(page)

  await expect(dialog.getByRole('tab', { name: 'Perusasetukset' })).toHaveAttribute('aria-selected', 'true')
  await expect(dialog.getByText('Koko suodatin')).toBeVisible()
  await expect(dialog.getByText('Variantit', { exact: true })).toBeVisible()
  await expect(dialog.getByText(/^Variantin .* vaihtoehdot$/)).toBeVisible()

  await expect(dialog.getByRole('textbox', { name: 'Koordinaattiavain' })).toHaveCount(0)
  await expect(dialog.getByRole('textbox', { name: 'Variantin avain' })).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Poista variantti' })).toHaveCount(0)

  await openStructureTab(dialog)

  await expect(dialog.getByText('Kytkennät')).toBeVisible()
  await expect(dialog.getByRole('textbox', { name: 'Koordinaattiavain' })).toBeVisible()
  await expect(dialog.getByRole('textbox', { name: 'Arvon korvaus' })).toHaveCount(0)
})

test('a superuser can edit the wiring fields and the variant conditions', async ({ page, request }) => {
  await openInEditMode(page)
  const dialog = await openGear(page)

  await openStructureTab(dialog)

  await expect(
    dialog.getByText('Näiden muuttaminen voi rikkoa tallennetut vastaukset ja hävittää käännöksiä.')
  ).toBeVisible()
  await expect(dialog.getByRole('textbox', { name: 'Koordinaattiavain' })).toBeEnabled()
  await expect(dialog.getByRole('textbox', { name: 'Yläsuodattimen ID' })).toBeEnabled()
  await expect(dialog.getByRole('textbox', { name: 'Variantin avain' }).first()).toBeEnabled()
  await expect(dialog.getByRole('button', { name: 'Poista variantti' }).first()).toBeDisabled()

  await dialog.getByRole('textbox', { name: 'Koordinaattiavain' }).fill('e2e-coordinate')
  await dialog.getByRole('button', { name: 'Tallenna' }).click()
  await expect(dialog).toBeHidden()

  const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const config = payload.filters.find((filter: { id: string }) => filter.id === 'lang')
  expect(config.coordinateKey).toBe('e2e-coordinate')
})

test('a regular admin sees the restricted fields read-only and no delete buttons', async ({ browser, e2eUserId }) => {
  const context = await browser.newContext({
    extraHTTPHeaders: { 'x-e2e-user': e2eUserId, 'x-e2e-role': 'admin' },
  })
  const page = await context.newPage()

  await openInEditMode(page)
  const dialog = await openGear(page)

  await expect(dialog.getByRole('textbox', { name: 'Arvon korvaus' }).first()).toBeEnabled()

  await openStructureTab(dialog)

  await expect(dialog.getByText('Osa kentistä vaatii pääkäyttäjän oikeudet ja näkyy vain luettavana.')).toBeVisible()
  await expect(dialog.getByRole('textbox', { name: 'Koordinaattiavain' })).toBeDisabled()
  await expect(dialog.getByRole('textbox', { name: 'Yläsuodattimen ID' })).toBeDisabled()
  await expect(dialog.getByRole('textbox', { name: 'Variantin avain' }).first()).toBeDisabled()
  await expect(dialog.getByRole('button', { name: 'Poista variantti' }).first()).toBeDisabled()
  await expect(dialog.getByRole('button', { name: 'Poista vaihtoehto' }).first()).toBeDisabled()

  await dialog.getByRole('button', { name: 'Tallenna' }).click()
  await expect(dialog).toBeHidden()

  await context.close()
})

test('the mutate route refuses a destructive op from a regular admin', async ({
  playwright,
  baseURL,
  e2eUserId,
  request,
}) => {
  const variantName = await firstVariantName(request)
  const adminRequest = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { 'x-e2e-user': e2eUserId, 'x-e2e-role': 'admin' },
  })

  const forbidden = await adminRequest.post(`${SNAPSHOTS_PATH}/${snapshotId}/mutate`, {
    data: {
      mutations: {
        wordings: [],
        settings: [{ op: 'deleteVariant', filterId: 'lang', variantName }],
      },
    },
  })
  expect(forbidden.status()).toBe(403)
  expect((await forbidden.json()).restricted).toEqual(['deleteVariant'])

  const allowed = await adminRequest.post(`${SNAPSHOTS_PATH}/${snapshotId}/mutate`, {
    data: {
      mutations: {
        wordings: [],
        settings: [{ op: 'variantSkipped', filterId: 'lang', variantName, skipped: false }],
      },
    },
  })
  expect(allowed.status()).toBe(200)

  await adminRequest.dispose()
})

test('the info-only filter body is editable and saves to extraInfo', async ({ page, request }) => {
  await openInEditMode(page)

  await page.getByRole('button', { name: 'Aikaisemmat opinnot', expanded: false }).click()

  const editable = page.getByTestId('editable-previusly-done-lang-extraInfo')
  await expect(editable).toBeVisible()
  await editable.click()

  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()
  await expect(editor.getByTestId('wording-edit-note')).toHaveText('Lisätieto on sama kaikissa varianteissa.')

  const finnish = editor.getByRole('textbox', { name: 'Suomeksi' })
  await expect(finnish).toBeVisible()
  await finnish.fill('Muokattu lisatieto')
  await editor.getByRole('button', { name: 'Tallenna' }).click()
  await expect(editor).toBeHidden()

  const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const config = payload.filters.find((filter: { id: string }) => filter.id === 'previusly-done-lang')
  expect(config.extraInfo.fi).toBe('Muokattu lisatieto')
})
