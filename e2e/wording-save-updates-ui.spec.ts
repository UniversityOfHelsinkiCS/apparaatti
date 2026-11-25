import type { APIRequestContext, Locator, Page } from '@playwright/test'

import { expect, test } from './fixtures'

// The app defaults to Finnish; these tests never switch the UI language.
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

const openWelcomeModal = async (page: Page) => {
  await page.getByRole('button', { name: 'Vastaa alkukysymyksiin' }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  return modal
}

const LANGUAGE_LABELS = ['Suomeksi', 'Ruotsiksi', 'Englanniksi']

/** Clicks an edit handle, walks the wizard to the text step, and returns the open editor. */
const openWordingEditor = async (page: Page, handle: Locator) => {
  await handle.click()
  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()

  const continueButton = editor.getByRole('button', { name: 'Jatka' })
  if (await continueButton.isVisible()) {
    await continueButton.click()
  }

  return editor
}

const saveWording = async (page: Page, handle: Locator, text: string) => {
  const editor = await openWordingEditor(page, handle)
  await editor.getByRole('textbox', { name: 'Suomeksi' }).fill(text)
  await editor.getByRole('button', { name: 'Tallenna' }).click()
  await expect(editor).toBeHidden()
}

/** Clears every language box, which is the path that deleted the text instead of emptying it. */
const clearWordingCompletely = async (page: Page, handle: Locator) => {
  const editor = await openWordingEditor(page, handle)

  for (const label of LANGUAGE_LABELS) {
    await editor.getByRole('textbox', { name: label }).fill('')
  }

  await editor.getByRole('button', { name: 'Tallenna' }).click()
  await expect(editor).toBeHidden()
}

/** Hands the text back to the shared one through the explicit button, not through a blank box. */
const useSharedWording = async (page: Page, handle: Locator) => {
  const editor = await openWordingEditor(page, handle)
  await editor.getByRole('button', { name: 'Käytä yhteistä tekstiä' }).click()
  await expect(editor).toBeHidden()
}

/** Sidebar accordions start collapsed unless the filter is mandatory. */
const expandFilter = async (page: Page, shortName: string) => {
  const trigger = page.locator('button[aria-controls]', { hasText: shortName })
  await expect(trigger).toBeVisible()

  if ((await trigger.getAttribute('aria-expanded')) === 'false') {
    await trigger.click()
  }

  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ request, e2eUserId }) => {
  snapshotId = await createSnapshot(request, `e2e-wording-save-${e2eUserId}`)
})

test.afterAll(async ({ request }) => {
  await request.delete(`${SNAPSHOTS_PATH}/${snapshotId}`)
})

test('a saved question text replaces the old one in the sidebar', async ({ page }) => {
  await openInEditMode(page)

  const sidebar = page.getByRole('navigation', { name: /suodat/i })
  const questionText = sidebar.getByTestId('question-text-lang')
  await expect(questionText).toBeVisible()

  await saveWording(page, sidebar.getByTestId('editable-lang-question'), 'Sivupalkin kysymys e2e')

  await expect(questionText).toHaveText('Sivupalkin kysymys e2e')
})

test('a saved option text replaces the old one in the sidebar', async ({ page }) => {
  await openInEditMode(page)

  const sidebar = page.getByRole('navigation', { name: /suodat/i })
  const option = sidebar.getByTestId('primary-language-option-sv')
  await expect(option).toBeVisible()

  await saveWording(page, sidebar.getByTestId('editable-primary-language-option-sv'), 'Sivupalkin vaihtoehto e2e')

  await expect(option).toContainText('Sivupalkin vaihtoehto e2e')
})

test('a saved short name replaces the old one in the sidebar accordion', async ({ page }) => {
  await openInEditMode(page)

  await saveWording(page, page.getByTestId('editable-lang-variantShortName'), 'Sivupalkin nimi e2e')

  await expect(page.locator('button[aria-controls]', { hasText: 'Sivupalkin nimi e2e' })).toBeVisible()
})

/** Points the page at one specific variant through the overlay's change-variant dialog. */
const pickVariant = async (page: Page, conditions: Record<string, string>) => {
  await page.getByTestId('change-variant-button').click()
  const dialog = page.getByTestId('change-variant-dialog')
  await expect(dialog).toBeVisible()

  for (const [label, option] of Object.entries(conditions)) {
    await dialog.getByRole('combobox', { name: new RegExp(label) }).click()
    await page.getByRole('option', { name: option, exact: true }).click()
  }

  await dialog.getByRole('button', { name: 'Vaihda', exact: true }).click()
  await expect(dialog).toBeHidden()
  await page.waitForLoadState('networkidle')
}

test('a saved question text replaces the old one on a non-default variant', async ({ page }) => {
  await openInEditMode(page)
  await pickVariant(page, {
    'Haettavan kurssin kieli': 'suomi',
    Koulusivistyskieli: 'suomi',
    Suoritustapa: 'kirjallinen',
  })

  await expandFilter(page, 'Mukautettu')

  const questionText = page.getByTestId('question-text-challenge')
  await expect(questionText).toContainText('elämäntilanteesi')

  await saveWording(page, page.getByTestId('editable-challenge-question'), 'Variantin kysymys e2e')

  await expect(questionText).toHaveText('Variantin kysymys e2e')
})

test('a saved question text replaces the old one in the welcome modal', async ({ page }) => {
  await openInEditMode(page)
  const modal = await openWelcomeModal(page)

  const questionText = modal.getByTestId('question-text-primary-language')
  await expect(questionText).toBeVisible()

  await saveWording(page, modal.getByTestId('editable-primary-language-question'), 'Alkukysymys e2e')

  await expect(questionText).toHaveText('Alkukysymys e2e')
})

test('a saved option text replaces the old one in the welcome modal', async ({ page }) => {
  await openInEditMode(page)
  const modal = await openWelcomeModal(page)

  const option = modal.getByTestId('primary-language-option-fi')
  await expect(option).toBeVisible()

  await saveWording(page, modal.getByTestId('editable-primary-language-option-fi'), 'Alkuvaihtoehto e2e')

  await expect(option).toContainText('Alkuvaihtoehto e2e')
})

test('a saved faculty question text replaces the old one in the welcome modal', async ({ page }) => {
  await openInEditMode(page)
  const modal = await openWelcomeModal(page)

  const questionText = modal.getByTestId('question-text-study-field-select')
  await expect(questionText).toBeVisible()

  await saveWording(page, modal.getByTestId('editable-study-field-select-question'), 'Tiedekuntakysymys e2e')

  await expect(questionText).toHaveText('Tiedekuntakysymys e2e')
})

test('whitespace is kept as typed rather than treated as empty', async ({ page }) => {
  await openInEditMode(page)

  const sidebar = page.getByRole('navigation', { name: /suodat/i })
  await saveWording(page, sidebar.getByTestId('editable-lang-question'), '  Välilyönnit e2e  ')

  await expect(sidebar.getByTestId('question-text-lang')).toContainText('Välilyönnit e2e')
})

test('clearing every language empties a question text in the sidebar', async ({ page }) => {
  await openInEditMode(page)

  const sidebar = page.getByRole('navigation', { name: /suodat/i })
  await clearWordingCompletely(page, sidebar.getByTestId('editable-lang-question'))

  await expect(sidebar.getByTestId('question-text-lang')).toHaveText('')
})

test('clearing every language empties an option text in the sidebar', async ({ page }) => {
  await openInEditMode(page)

  const sidebar = page.getByRole('navigation', { name: /suodat/i })
  await clearWordingCompletely(page, sidebar.getByTestId('editable-primary-language-option-sv'))

  await expect(sidebar.getByTestId('primary-language-option-sv')).toHaveText('')
})

test('clearing every language empties a question text in the welcome modal', async ({ page }) => {
  await openInEditMode(page)
  const modal = await openWelcomeModal(page)

  await clearWordingCompletely(page, modal.getByTestId('editable-primary-language-question'))

  await expect(modal.getByTestId('question-text-primary-language')).toHaveText('')
})

test('clearing every language empties the faculty question text in the welcome modal', async ({ page }) => {
  await openInEditMode(page)
  const modal = await openWelcomeModal(page)

  await clearWordingCompletely(page, modal.getByTestId('editable-study-field-select-question'))

  await expect(modal.getByTestId('question-text-study-field-select')).toHaveText('')
})

test('clearing an info text on a variant does not bring the shared text back', async ({ page }) => {
  await openInEditMode(page)
  await pickVariant(page, {
    'Haettavan kurssin kieli': 'suomi',
    Koulusivistyskieli: 'suomi',
    Suoritustapa: 'kirjallinen',
  })

  await expandFilter(page, 'Mukautettu')

  await page.getByTestId('question-title-challenge').getByRole('button', { name: 'Lisätietoa' }).click()
  const infoModal = page.getByRole('dialog')
  await expect(infoModal).toBeVisible()

  await saveWording(page, infoModal.getByTestId('editable-challenge-explanation'), 'Variantin lisätieto e2e')
  await expect(infoModal).toContainText('Variantin lisätieto e2e')

  await clearWordingCompletely(page, infoModal.getByTestId('editable-challenge-explanation'))

  await expect(infoModal.getByTestId('editable-challenge-explanation')).toHaveText('Ei lisätietoa')
  await expect(infoModal).not.toContainText('Variantin lisätieto e2e')
})

test('the shared text button still hands an info text back to the shared one', async ({ page }) => {
  await openInEditMode(page)
  await pickVariant(page, {
    'Haettavan kurssin kieli': 'suomi',
    Koulusivistyskieli: 'suomi',
    Suoritustapa: 'kirjallinen',
  })

  await expandFilter(page, 'Mukautettu')

  await page.getByTestId('question-title-challenge').getByRole('button', { name: 'Lisätietoa' }).click()
  const infoModal = page.getByRole('dialog')
  await expect(infoModal).toBeVisible()

  await saveWording(page, infoModal.getByTestId('editable-challenge-explanation'), 'Peruttava lisätieto e2e')
  await expect(infoModal).toContainText('Peruttava lisätieto e2e')

  await useSharedWording(page, infoModal.getByTestId('editable-challenge-explanation'))

  await expect(infoModal).not.toContainText('Peruttava lisätieto e2e')
})

test('clearing every language empties an info-only filter body', async ({ page }) => {
  await openInEditMode(page)

  await expandFilter(page, 'Aikaisemmat opinnot')

  const body = page.getByTestId('editable-previusly-done-lang-variantExtraInfo')
  await saveWording(page, body, 'Info-teksti e2e')
  await expect(body).toHaveText('Info-teksti e2e')

  await clearWordingCompletely(page, body)

  await expect(body).toHaveText('Ei lisätietoa')
})

// An emptied explanation falls back to the "no extra info" placeholder, not to the text that was there.
test('emptying an info text drops it back to the no-extra-info placeholder', async ({ page }) => {
  await openInEditMode(page)

  await page.getByTestId('question-title-lang').getByRole('button', { name: 'Lisätietoa' }).click()
  const infoModal = page.getByRole('dialog')
  await expect(infoModal).toBeVisible()

  await saveWording(page, infoModal.getByTestId('editable-lang-explanation'), 'Lisätieto e2e')
  await expect(infoModal).toContainText('Lisätieto e2e')

  await clearWordingCompletely(page, infoModal.getByTestId('editable-lang-explanation'))
  await expect(infoModal.getByTestId('editable-lang-explanation')).toHaveText('Ei lisätietoa')
  await expect(infoModal).not.toContainText('Lisätieto e2e')
})

test('a short name is blank only when every language is empty, and then it cannot be saved', async ({ page }) => {
  await openInEditMode(page)

  await page.getByTestId('editable-lang-variantShortName').click()
  const editor = page.getByTestId('wording-edit-dialog')
  await expect(editor).toBeVisible()
  await editor.getByRole('button', { name: 'Jatka' }).click()

  const save = editor.getByRole('button', { name: 'Tallenna' })

  // Emptying one language is a normal save; the other languages still carry the name.
  await editor.getByRole('textbox', { name: 'Suomeksi' }).fill('')
  await expect(save).toBeEnabled()

  await editor.getByRole('textbox', { name: 'Ruotsiksi' }).fill('')
  await editor.getByRole('textbox', { name: 'Englanniksi' }).fill('')
  await expect(save).toBeDisabled()

  await editor.getByRole('button', { name: 'Peruuta' }).click()
  await expect(editor).toBeHidden()
})
