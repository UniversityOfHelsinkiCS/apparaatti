import type { APIRequestContext, Page } from '@playwright/test'

import { expect, test } from './fixtures'

// The app defaults to Finnish; these tests never switch the UI language.
const ANY = 'mikä tahansa'
const EDITING_VERSION_KEY = 'apparaatti-filter-wording-version'
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
  await expect(editor.getByTestId('wording-edit-target')).toHaveText('Muokattava variantti: Yleinen oletusteksti')
  await expect(editor.getByRole('textbox', { name: 'Suomeksi' })).toBeVisible()

  // Back to step 1 inside the same modal, and pick a new variant.
  await editor.getByRole('button', { name: 'Vaihda' }).click()
  await expect(editor).toBeVisible()
  await editor.getByRole('combobox', { name: /Muokattava variantti/ }).click()
  await page.getByRole('option', { name: 'Luo uusi variantti', exact: true }).click()
  await expect(editor.getByRole('combobox', { name: /Tiedekunta/ })).toBeVisible()
  await editor.getByRole('button', { name: 'Jatka' }).click()
  await expect(editor.getByTestId('wording-edit-target')).toHaveText(/^Muokattava variantti: Uusi variantti: /)

  // Cancel closes the modal without touching the page variant.
  await editor.getByRole('button', { name: 'Peruuta' }).click()
  await expect(editor).toBeHidden()
  expect(await overlayVariant(page)).toBe(pageVariant)
})

test('filter-wide texts open straight on the text step', async ({ page }) => {
  await openInEditMode(page)
  await expectWelcomeModalStaysClosed(page)

  await page.locator('[data-testid$="-shortName"]').first().click()
  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()
  await expect(editor.getByTestId('wording-edit-target')).toHaveText('Muokattava variantti: kaikki variantit')
  await expect(editor.getByRole('textbox', { name: 'Suomeksi' })).toBeVisible()
  await expect(editor.getByRole('button', { name: 'Vaihda' })).toHaveCount(0)
})
