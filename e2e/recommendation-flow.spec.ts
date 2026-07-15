import { expect, test } from '@playwright/test'

test.describe('core recommendation flow', () => {
  test('answering the welcome questions surfaces the matching course', async ({ page }) => {
    // The app defaults to Finnish unless a language is already stored, so force English
    // before the app boots to keep the assertions below language-stable.
    await page.addInitScript(() => window.localStorage.setItem('lang', 'en'))
    await page.goto('/')

    const welcomeModal = page.getByRole('dialog')
    await expect(welcomeModal).toBeVisible()

    // Faculty: Faculty of Science (H50). The dropdown's default option is DB-order-dependent,
    // so select it explicitly rather than relying on the default.
    await welcomeModal.getByTestId('study-field-select').click()
    await page.getByRole('option', { name: 'Faculty of Science', exact: true }).click()

    // School language: Finnish. This is the last mandatory question shown in the welcome
    // modal itself, so it auto-closes once answered - "Course language" is mandatory too,
    // but only surfaced in the sidebar (showInWelcomeModal: false in the current config).
    await welcomeModal.getByTestId('primary-language-option-fi').click()
    await expect(welcomeModal).toBeHidden()

    // Course language: Swedish (different from school language, so no "Communication" /
    // primary-language-specification follow-up question is required).
    await page.getByTestId('lang-option-sv').click()

    // Only one seeded course matches this answer combination and survives the app's
    // default study-year filter: KK-RUMALU.
    await expect(page.getByText('KK-RUMALU')).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: /Oral and Written Skills.*Swedish \(CEFR B1\)/ })
    ).toBeVisible()

    await expect(page.getByRole('heading', { name: 'No courses found' })).toHaveCount(0)
    // Guard against an overly broad match returning unrelated recommendations too.
    await expect(page.getByText('KK-ENKAIKKI')).toHaveCount(0)
  })
})
