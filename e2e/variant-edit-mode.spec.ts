import type { APIRequestContext, Page } from '@playwright/test'

import { expect, test } from './fixtures'

// The app defaults to Finnish; these tests never switch the UI language.
const ANY = 'mikä tahansa'
const EDITING_VERSION_KEY = 'apparaatti-filter-wording-version'
const PICK_VARIANT_KEY = 'apparaatti-filter-wording-pick-variant'
const SNAPSHOTS_PATH = '/api/admin/filter-config/snapshots'

let snapshotId: number
let organisationCodes: string[]

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
}

/** The variant key shown in the overlay, e.g. "sv-fi-H3456". */
const overlayVariant = async (page: Page) => {
  const text = await page
    .getByTestId('filter-edit-mode-overlay')
    .getByText(/^Muokattava variantti:/)
    .innerText()
  return text.replace(/^Muokattava variantti:\s*/, '').trim()
}

const expectNoOrganisation = async (page: Page) => {
  await expect.poll(() => overlayVariant(page)).not.toBe('')
  const variant = await overlayVariant(page)
  for (const code of organisationCodes) {
    expect(variant.split('-')).not.toContain(code)
  }
}

/** The welcome modal must not pop up by itself; give its effect time to fire before asserting. */
const expectWelcomeModalStaysClosed = async (page: Page) => {
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('dialog')).toHaveCount(0)
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ request, e2eUserId }) => {
  snapshotId = await createSnapshot(request, `e2e-variant-edit-${e2eUserId}`)
  const organisations = await (await request.get('/api/organisations/supported')).json()
  organisationCodes = organisations.map((organisation: { code: string }) => organisation.code)
  expect(organisationCodes.length).toBeGreaterThan(0)
})

test.afterAll(async ({ request }) => {
  await request.delete(`${SNAPSHOTS_PATH}/${snapshotId}`)
})

test('edit mode does not force the welcome modal open', async ({ page }) => {
  await openInEditMode(page)
  await expectWelcomeModalStaysClosed(page)
})

test('the start modal offers "mikä tahansa" as faculty in edit mode and can be closed with it', async ({ page }) => {
  await openInEditMode(page)

  await page.getByRole('button', { name: 'Vastaa alkukysymyksiin' }).click()
  const welcomeModal = page.getByRole('dialog')
  await expect(welcomeModal).toBeVisible()

  await welcomeModal.getByTestId('study-field-select').click()
  await page.getByTestId('study-field-option-any').click()
  await expect(welcomeModal.getByTestId('study-field-select')).toContainText(ANY)

  const done = welcomeModal.getByRole('button', { name: 'Valmis' })
  await expect(done).toBeEnabled()
  await done.click()

  await expectWelcomeModalStaysClosed(page)
  await expectNoOrganisation(page)
})

test('the variant dialog sets the faculty to "mikä tahansa" without opening the welcome modal', async ({ page }) => {
  await openInEditMode(page)
  await expectWelcomeModalStaysClosed(page)

  await page.getByTestId('change-variant-button').click()
  const dialog = page.getByTestId('change-variant-dialog')
  await expect(dialog).toBeVisible()

  await dialog.getByRole('combobox', { name: /Tiedekunta/ }).click()
  await page.getByRole('option', { name: ANY, exact: true }).click()
  await dialog.getByRole('button', { name: 'Vaihda', exact: true }).click()

  await expect(dialog).toBeHidden()
  await expectWelcomeModalStaysClosed(page)
  await expectNoOrganisation(page)

  // The faculty stays "mikä tahansa" and is not filled in again.
  await page.getByTestId('change-variant-button').click()
  await expect(dialog.getByRole('combobox', { name: /Tiedekunta/ })).toContainText(ANY)
})

test('outside edit mode the faculty select has no "mikä tahansa" option', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const welcomeModal = page.getByRole('dialog')
  if (!(await welcomeModal.isVisible())) {
    await page.getByRole('button', { name: 'Vastaa alkukysymyksiin' }).click()
  }
  await expect(welcomeModal).toBeVisible()

  await welcomeModal.getByTestId('study-field-select').click()
  await expect(page.getByRole('option').first()).toBeVisible()
  await expect(page.getByTestId('study-field-option-any')).toHaveCount(0)
})

test('the wording editor is a two-step modal: confirm the variant, then edit the text', async ({ page }) => {
  await openInEditMode(page)
  await expectWelcomeModalStaysClosed(page)
  const pageVariant = await overlayVariant(page)

  await page.getByTestId('editable-lang-question').click()
  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(1)

  // Step 1: confirm the variant; no text fields yet.
  const variantSelect = editor.getByRole('combobox', { name: /Muokattava variantti/ })
  await expect(variantSelect).toBeVisible()
  await expect(editor.getByRole('textbox', { name: 'Suomeksi' })).toHaveCount(0)

  // Changing the variant keeps the modal open.
  await variantSelect.click()
  await page.getByRole('option', { name: 'Yleinen oletusteksti', exact: true }).click()
  await expect(editor).toBeVisible()
  await expect(editor.getByText(/Muokkaat oletustekstiä/)).toBeVisible()
  await editor.getByRole('button', { name: 'Jatka' }).click()

  // Step 2: edit the text for the confirmed variant.
  await expect(editor.getByTestId('wording-edit-target')).toHaveText('Yleinen oletusteksti')
  await expect(editor.getByRole('textbox', { name: 'Suomeksi' })).toBeVisible()

  // Back to step 1 inside the same modal, and pick a new variant.
  await editor.getByRole('button', { name: 'Vaihda' }).click()
  await expect(editor).toBeVisible()
  await editor.getByRole('combobox', { name: /Muokattava variantti/ }).click()
  await page.getByRole('option', { name: 'Luo uusi variantti', exact: true }).click()
  await expect(editor.getByRole('combobox', { name: /Tiedekunta/ })).toBeVisible()
  await editor.getByRole('button', { name: 'Jatka' }).click()
  await expect(editor.getByTestId('wording-edit-target')).toHaveText(/^Uusi variantti: /)

  // Cancel closes the modal without touching the page variant.
  await editor.getByRole('button', { name: 'Peruuta' }).click()
  await expect(editor).toBeHidden()
  expect(await overlayVariant(page)).toBe(pageVariant)
})

test('a hidden filter edits its short name on the default variant', async ({ page }) => {
  await openInEditMode(page)
  await expectWelcomeModalStaysClosed(page)

  await page.getByRole('button', { name: 'Avaa suodattimien yleisnäkymä' }).click()
  const overview = page.getByRole('dialog')
  const sidebar = overview.getByTestId('filter-order-row-primary-language').getByRole('checkbox', {
    name: 'Sivupalkki',
  })
  const sidebarWasChecked = await sidebar.isChecked()
  if (sidebarWasChecked) {
    await sidebar.click()
    await expect(sidebar).not.toBeChecked()
  }

  const hiddenShortName = page.getByTestId('editable-primary-language-variantShortName')
  await expect(hiddenShortName).toBeVisible()
  await hiddenShortName.click()

  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()
  await editor.getByRole('button', { name: 'Jatka' }).click()
  await expect(editor.getByTestId('wording-edit-target')).toHaveText('Yleinen oletusteksti')
  await expect(editor.getByRole('textbox', { name: 'Suomeksi' })).toBeVisible()
  await editor.getByRole('button', { name: 'Peruuta' }).click()
  await expect(editor).toBeHidden()

  if (sidebarWasChecked) {
    await sidebar.click()
    await expect(sidebar).toBeChecked()
  }
})

test('the picker offers exactly one default, which edits the default variant', async ({ page, request }) => {
  await openInEditMode(page)
  await expectWelcomeModalStaysClosed(page)

  await page.getByTestId('editable-lang-variantShortName').click()
  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()

  const variantSelect = editor.getByRole('combobox', { name: /Muokattava variantti/ })
  await variantSelect.click()
  await expect(page.getByRole('option', { name: 'Yleinen oletusteksti', exact: true })).toHaveCount(1)
  await expect(page.getByRole('option', { name: 'Yhteinen kaikille varianteille', exact: true })).toHaveCount(0)
  await page.getByRole('option', { name: 'Yleinen oletusteksti', exact: true }).click()
  await editor.getByRole('button', { name: 'Jatka' }).click()

  await expect(editor.getByTestId('wording-edit-target')).toHaveText('Yleinen oletusteksti')
  await expect(editor.getByTestId('wording-edit-note')).toHaveCount(0)
  await expect(editor.getByRole('button', { name: 'Käytä yhteistä tekstiä' })).toHaveCount(0)

  const finnish = editor.getByRole('textbox', { name: 'Suomeksi' })
  const swedish = editor.getByRole('textbox', { name: 'Ruotsiksi' })
  const english = editor.getByRole('textbox', { name: 'Englanniksi' })
  await finnish.fill('')
  await swedish.fill('')
  await english.fill('')
  await expect(editor.getByText('Lyhyt nimi tarvitaan ainakin yhdellä kielellä.')).toBeVisible()
  await expect(editor.getByRole('button', { name: 'Tallenna' })).toBeDisabled()

  await finnish.fill('Opetuskieli e2e')
  await expect(editor.getByRole('button', { name: 'Tallenna' })).toBeEnabled()
  await editor.getByRole('button', { name: 'Tallenna' }).click()
  await expect(editor).toBeHidden()

  await expect(page.locator('button[aria-controls]', { hasText: 'Opetuskieli e2e' })).toBeVisible()

  const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
  const config = payload.filters.find((filter: { id: string }) => filter.id === 'lang')
  const fallback = config.variants.find(
    (candidate: { lang: string | null; primaryLanguage: string | null }) =>
      candidate.lang === null && candidate.primaryLanguage === null
  )
  expect(fallback.shortName.fi).toBe('Opetuskieli e2e')
})

test('a non-default variant overrides the default short name and can hand it back', async ({ page, request }) => {
  await openInEditMode(page)
  await expectWelcomeModalStaysClosed(page)

  type SnapshotVariant = { name: string; lang: string | null; shortName?: { fi: string } }

  const langVariants = async (): Promise<SnapshotVariant[]> => {
    const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
    return payload.filters.find((filter: { id: string }) => filter.id === 'lang').variants
  }

  await page.getByTestId('editable-lang-variantShortName').click()
  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()

  await editor.getByRole('combobox', { name: /Muokattava variantti/ }).click()
  await page.getByRole('option', { name: 'Luo uusi variantti', exact: true }).click()
  await editor.getByRole('combobox', { name: /Haettavan kurssin kieli/ }).click()
  await page.getByRole('option', { name: 'ruotsi', exact: true }).click()
  await editor.getByRole('button', { name: 'Jatka' }).click()

  await editor.getByRole('textbox', { name: 'Suomeksi' }).fill('Ruotsi-nimi e2e')
  await editor.getByRole('button', { name: 'Tallenna' }).click()
  await expect(editor).toBeHidden()

  const afterSave = await langVariants()
  const created = afterSave.find(variant => variant.lang === 'sv')
  expect(created?.shortName?.fi).toBe('Ruotsi-nimi e2e')
  expect(afterSave.find(variant => variant.name === 'default')?.shortName?.fi).not.toBe('Ruotsi-nimi e2e')

  await page.getByTestId('editable-lang-variantShortName').click()
  await expect(editor).toBeVisible()
  await editor.getByRole('combobox', { name: /Muokattava variantti/ }).click()
  await page.getByRole('option', { name: created!.name, exact: true }).click()
  await editor.getByRole('button', { name: 'Jatka' }).click()

  const useShared = editor.getByRole('button', { name: 'Käytä yhteistä tekstiä' })
  await expect(useShared).toBeVisible()
  await useShared.click()
  await expect(editor).toBeHidden()

  const afterClear = await langVariants()
  expect(afterClear.find(variant => variant.name === created!.name)?.shortName).toBeUndefined()
})

test('the info-icon text can be worded per variant even when the filter has none', async ({ page }) => {
  await openInEditMode(page)
  await expectWelcomeModalStaysClosed(page)

  await page.getByTestId('question-title-lang').getByRole('button', { name: 'Lisätietoa' }).click()
  const infoModal = page.getByRole('dialog')
  await expect(infoModal).toBeVisible()

  await infoModal.getByTestId('editable-lang-explanation').click()
  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()
  await expect(editor.getByRole('combobox', { name: /Muokattava variantti/ })).toBeVisible()

  await editor.getByRole('combobox', { name: /Muokattava variantti/ }).click()
  await expect(page.getByRole('option', { name: 'Yleinen oletusteksti', exact: true })).toHaveCount(1)
  await expect(page.getByRole('option', { name: 'Yhteinen kaikille varianteille', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await editor.getByRole('button', { name: 'Jatka' }).click()

  await editor.getByRole('textbox', { name: 'Suomeksi' }).fill('Variantin oma lisätieto e2e')
  await editor.getByRole('button', { name: 'Tallenna' }).click()
  await expect(editor).toBeHidden()
  await expect(page.getByRole('dialog')).toContainText('Variantin oma lisätieto e2e')
})

test('entering edit mode opens the variant select, which only closes by picking', async ({ page }) => {
  await openInEditMode(page)
  await page.evaluate(key => window.localStorage.setItem(key, 'true'), PICK_VARIANT_KEY)
  await page.reload()

  const dialog = page.getByTestId('pick-variant-dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Peruuta' })).toHaveCount(0)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()

  await dialog.getByRole('combobox', { name: /Tiedekunta/ }).click()
  await page.getByRole('option', { name: ANY, exact: true }).click()
  await dialog.getByRole('button', { name: 'Valitse' }).click()

  await expect(dialog).toBeHidden()
  await expectWelcomeModalStaysClosed(page)
  await expectNoOrganisation(page)

  await page.reload()
  await expect(page.getByTestId('filter-edit-mode-overlay')).toBeVisible()
  await expect(page.getByTestId('pick-variant-dialog')).toHaveCount(0)
})
