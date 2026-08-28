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

test.describe('landmarks and skip link', () => {
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings')
  })

  test('the filter sidebar is a named navigation landmark', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    const filters = page.getByRole('navigation', { name: 'Course filters' })
    await expect(filters).toBeAttached()
    await expect(filters.getByTestId('sidebar-clear-choices')).toBeAttached()
  })
})
