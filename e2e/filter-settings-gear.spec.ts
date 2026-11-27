import type { APIRequestContext, Locator, Page } from '@playwright/test'

import { expect, test } from './fixtures'

const EDITING_VERSION_KEY = 'apparaatti-filter-wording-version'
const SNAPSHOTS_PATH = '/api/admin/filter-config/snapshots'
const SEEDED_WITHOUT_TEXT = 'Backend locale key'

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

test('the mutate route refuses a destructive op from a regular admin', async ({ request, adminRequest }) => {
  const variantName = await firstVariantName(request)

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
})

test('the info-only filter body is editable and saves to extraInfo', async ({ page, request }) => {
  await openInEditMode(page)

  const trigger = page.locator('button[aria-controls]', { hasText: 'Aikaisemmat opinnot' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.locator('span[aria-hidden="true"]').first().click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  const editable = page.getByTestId('editable-previusly-done-lang-variantExtraInfo')
  await expect(editable).toBeVisible()
  await expect(editable).toContainText('Lue tarkemmat ohjeet')
  await editable.click()

  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()

  await editor.getByRole('combobox', { name: /Muokattava variantti/ }).click()
  await page.getByRole('option', { name: 'Yleinen oletusteksti', exact: true }).click()
  await editor.getByRole('button', { name: 'Jatka' }).click()

  const finnish = editor.getByRole('textbox', { name: 'Suomeksi' })
  await expect(finnish).toBeVisible()
  await finnish.fill('Muokattu lisatieto')
  await editor.getByRole('button', { name: 'Tallenna' }).click()
  await expect(editor).toBeHidden()

  const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const config = payload.filters.find((filter: { id: string }) => filter.id === 'previusly-done-lang')
  const fallback = config.variants.find(
    (candidate: { lang: string | null; primaryLanguage: string | null }) =>
      candidate.lang === null && candidate.primaryLanguage === null
  )
  expect(fallback.extraInfo.fi).toBe('Muokattu lisatieto')
})

test('the gear texts tab lists the filter texts and edits them through the wording wizard', async ({
  page,
  request,
}) => {
  await openInEditMode(page)
  const dialog = await openGear(page)

  await dialog.getByRole('tab', { name: 'Tekstit' }).click()
  await expect(dialog.getByTestId('filter-text-row-lang-variantShortName')).toBeVisible()
  await expect(dialog.getByTestId('filter-text-row-lang-question')).toBeVisible()
  await expect(dialog.getByTestId('filter-text-row-lang-explanation')).toBeVisible()
  await expect(dialog.getByTestId('filter-text-row-lang-variantExtraInfo')).toBeVisible()

  await dialog.getByTestId('filter-text-row-lang-explanation').getByRole('button').click()
  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()

  await editor.getByRole('combobox', { name: /Muokattava variantti/ }).click()
  await page.getByRole('option', { name: 'Yleinen oletusteksti', exact: true }).click()
  await editor.getByRole('button', { name: 'Jatka' }).click()
  await editor.getByRole('textbox', { name: 'Suomeksi' }).fill('Gear-lisatieto e2e')
  await editor.getByRole('button', { name: 'Tallenna' }).click()
  await expect(editor).toBeHidden()

  await expect(dialog).toBeVisible()
  await expect(dialog.getByTestId('filter-text-row-lang-explanation')).toContainText('Gear-lisatieto e2e')

  const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const config = payload.filters.find((filter: { id: string }) => filter.id === 'lang')
  const fallback = config.variants.find(
    (candidate: { lang: string | null; primaryLanguage: string | null }) =>
      candidate.lang === null && candidate.primaryLanguage === null
  )
  expect(fallback.explanation.fi).toBe('Gear-lisatieto e2e')
})

test('the gear can hide the yes-answer extra info for one variant', async ({ page, request }) => {
  await openInEditMode(page)
  const variantName = await firstVariantName(request)
  const dialog = await openGear(page)

  const toggle = dialog.getByRole('switch', { name: 'Piilota kyllä-vastauksen lisätieto' }).first()
  await expect(toggle).not.toBeChecked()
  await toggle.check()
  await dialog.getByRole('button', { name: 'Tallenna' }).click()
  await expect(dialog).toBeHidden()

  const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const config = payload.filters.find((filter: { id: string }) => filter.id === 'lang')
  const variant = config.variants.find((candidate: { name: string }) => candidate.name === variantName)
  expect(variant.extraInfoDisabled).toBe(true)

  const reopened = await openGear(page)
  await expect(reopened.getByRole('switch', { name: 'Piilota kyllä-vastauksen lisätieto' }).first()).toBeChecked()
})

test('the overview list toggles welcome modal and sidebar visibility', async ({ page, request }) => {
  await openInEditMode(page)

  await page.getByRole('button', { name: 'Avaa suodattimien yleisnäkymä' }).click()
  const overview = page.getByRole('dialog')
  await expect(overview.getByText('Suodattimet ja järjestys')).toBeVisible()

  const row = overview.getByTestId('filter-order-row-primary-language')
  await expect(row).toBeVisible()
  const welcome = row.getByRole('checkbox', { name: 'Aloitusikkuna' })
  const sidebar = row.getByRole('checkbox', { name: 'Sivupalkki' })

  const welcomeWasChecked = await welcome.isChecked()
  const sidebarWasChecked = await sidebar.isChecked()

  await welcome.click()
  await expect(welcome).toBeChecked({ checked: !welcomeWasChecked })
  await sidebar.click()
  await expect(sidebar).toBeChecked({ checked: !sidebarWasChecked })

  const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const config = payload.filters.find((filter: { id: string }) => filter.id === 'primary-language')
  expect(config.showInWelcomeModal).toBe(!welcomeWasChecked)
  expect(config.hideInFilterSidebar).toBe(sidebarWasChecked)

  await welcome.click()
  await expect(welcome).toBeChecked({ checked: welcomeWasChecked })
  await sidebar.click()
  await expect(sidebar).toBeChecked({ checked: sidebarWasChecked })

  const restored = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const restoredConfig = restored.filters.find((filter: { id: string }) => filter.id === 'primary-language')
  expect(restoredConfig.showInWelcomeModal).toBe(welcomeWasChecked)
  expect(restoredConfig.hideInFilterSidebar).toBe(!sidebarWasChecked)
})

test('edit mode renders the sidebar filters and their editable texts, not a blank page', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', error => consoleErrors.push(String(error)))

  await openInEditMode(page)

  const sidebar = page.getByRole('navigation', { name: /suodat/i })
  await expect(sidebar).toBeVisible()

  const triggers = page.locator('button[aria-controls]', { hasText: /\S/ })
  expect(await triggers.count()).toBeGreaterThan(3)

  await expect(page.getByTestId('editable-lang-variantShortName')).toBeVisible()
  await expect(page.getByTestId('editable-previusly-done-lang-variantShortName')).toBeVisible()
  await expect(page.locator('button[aria-controls] [role="button"]')).toHaveCount(0)

  const langTrigger = page.locator('button[aria-controls]', { hasText: 'Minkä kielen kursseja etsit?' })
  await expect(langTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(langTrigger).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('editable-lang-question')).toBeVisible()
  await expect(page.getByTestId('filter-settings-gear-lang')).toBeVisible()

  const unexpectedConsoleErrors = consoleErrors.filter(error => !error.startsWith(SEEDED_WITHOUT_TEXT))
  expect(unexpectedConsoleErrors).toEqual([])
})

test('the filter name toggles the accordion and the pencil opens the rename dialog', async ({ page }) => {
  await openInEditMode(page)

  const trigger = page.locator('button[aria-controls]', { hasText: 'Aikaisemmat opinnot' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('wording-edit-dialog')).toHaveCount(0)

  await expect(trigger.getByTestId('editable-previusly-done-lang-variantShortName')).toHaveCount(0)
  await page.getByTestId('editable-previusly-done-lang-variantShortName').click()
  await expect(page.getByTestId('wording-edit-dialog')).toBeVisible()
})

test('an option text selects the option, and its pencil opens the text editor', async ({ page }) => {
  await openInEditMode(page)

  const trigger = page.locator('button[aria-controls]', { hasText: 'Koulukieli' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  const option = page.getByTestId('primary-language-option-sv')
  await option.getByText('ruotsi', { exact: true }).click()
  await expect(page.getByTestId('wording-edit-dialog')).toHaveCount(0)
  await expect(option.getByRole('radio', { name: 'ruotsi' })).toBeChecked()

  await page.getByTestId('editable-primary-language-option-sv').click()
  await expect(page.getByTestId('wording-edit-dialog')).toBeVisible()
})
