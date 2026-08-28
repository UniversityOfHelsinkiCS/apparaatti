import { expect, type Page, test } from '@playwright/test'

async function answerWelcomeModal(page: Page) {
  const welcomeModal = page.getByRole('dialog')
  await expect(welcomeModal).toBeVisible()

  await welcomeModal.getByTestId('language-selector').click()
  await page.getByRole('option', { name: 'English', exact: true }).click()

  await welcomeModal.getByTestId('study-field-select').click()
  await page.getByRole('option', { name: 'Faculty of Science', exact: true }).click()

  await welcomeModal.getByTestId('primary-language-option-fi').click()
  await expect(welcomeModal).toBeHidden()
}

test.describe('filter option match counts', () => {
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings')
  })

  test('option names spell out the match count instead of a bare number', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    const filters = page.getByRole('navigation', { name: 'Course filters' })
    await expect(filters.getByRole('radio').first()).toBeAttached()

    await expect(filters.getByRole('radio', { name: /matching courses?$/ }).first()).toBeAttached()
    await expect(filters.getByRole('radio', { name: /\d$/ })).toHaveCount(0)
  })
})
