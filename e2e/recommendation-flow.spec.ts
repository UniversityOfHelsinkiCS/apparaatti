import { expect, type Page,test } from '@playwright/test'

const FACULTY = {
  science: 'Faculty of Science',
  theology: 'Faculty of Theology',
}

async function answerWelcomeModal(page: Page, faculty: string, primaryLanguage: 'fi' | 'sv') {
  const welcomeModal = page.getByRole('dialog')
  await expect(welcomeModal).toBeVisible()

  // The app defaults to Finnish. The selector's option labels are literal strings, not
  // translated, so this works regardless of the starting language.
  await welcomeModal.getByTestId('language-selector').click()
  await page.getByRole('option', { name: 'English', exact: true }).click()

  // The default faculty is DB-order-dependent, so select one explicitly.
  await welcomeModal.getByTestId('study-field-select').click()
  await page.getByRole('option', { name: faculty, exact: true }).click()

  // School language is the last mandatory welcome-modal question, so answering it closes
  // the modal - course language is mandatory too, but only lives in the sidebar.
  await welcomeModal.getByTestId(`primary-language-option-${primaryLanguage}`).click()
  await expect(welcomeModal).toBeHidden()
}

// Faculty of Theology + course language === school language triggers an org-specific filter
// (recommender.ts) requiring a "kkt-teo" tag that no seeded course has, so this always matches
// zero courses.
async function reachEmptyState(page: Page) {
  await page.goto('/')
  await answerWelcomeModal(page, FACULTY.theology, 'fi')

  await page.getByTestId('lang-option-fi').click()
  const communicationOption = page.getByTestId('primary-language-specification-option-writtenAndSpoken')
  await communicationOption.click()

  await expect(page.getByTestId('no-recommendations-heading')).toBeVisible()

  return { communicationOption }
}

test.describe('core recommendation flow', () => {
  // Completing the welcome modal persists an education language server-side for the shared
  // e2e mock user, which then stops the modal from auto-opening again. Reset it so every test
  // starts from a fresh onboarding state.
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings')
  })

  test('answering the welcome questions surfaces the matching course', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page, FACULTY.science, 'fi')

    await page.getByTestId('lang-option-sv').click()

    // 10 seeded realisations survive the default study-year filter for this combination.
    await expect(page.getByTestId('course-recommendation')).toHaveCount(10)
    await expect(
      page.getByTestId('course-recommendation').filter({ hasText: /Oral and Written Skills.*Swedish \(CEFR B1\)/ })
    ).toBeVisible()

    await expect(page.getByTestId('no-recommendations-heading')).toHaveCount(0)
    // Guard against an overly broad match returning unrelated recommendations too.
    await expect(page.getByText('KK-ENKAIKKI')).toHaveCount(0)
  })

  test('an answer combination with no matching courses shows the empty state', async ({ page }) => {
    await reachEmptyState(page)

    await expect(page.getByText('KK-RUMALU')).toHaveCount(0)
  })

  test('the clear choices button on the empty state resets sidebar filters', async ({ page }) => {
    const { communicationOption } = await reachEmptyState(page)

    // The sidebar has its own "Clear choices" button too; this testid targets the empty
    // state's copy specifically.
    const clearChoicesButton = page.getByTestId('empty-state-clear-choices')
    await clearChoicesButton.click()
    const confirmationModal = page.getByRole('dialog', { name: 'Reset all selections?' })
    await expect(confirmationModal).toBeVisible()
    await confirmationModal.getByRole('button', { name: 'Reset selections' }).click()
    await expect(confirmationModal).toBeHidden()

    // resetFilters() only clears sidebar-owned filters, not the welcome-modal-only faculty/
    // school-language answers. The "Communication" question disappearing (it depends on an
    // answered "lang") and the button giving way to the unanswered-filter prompt are the
    // observable proof the reset actually took effect.
    await expect(communicationOption).toBeHidden()
    await expect(clearChoicesButton).toHaveCount(0)
    await expect(page.getByTestId('no-recommendations-heading')).toBeVisible()
  })
})
