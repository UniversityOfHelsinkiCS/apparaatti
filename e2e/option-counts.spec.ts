import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'

async function answerWelcomeModal(page: Page) {
  const welcomeModal = page.getByRole('dialog')
  await expect(welcomeModal).toBeVisible()

  await welcomeModal.getByTestId('language-selector').click()
  await page.getByRole('option', { name: 'English', exact: true }).click()

  await welcomeModal.getByTestId('study-field-select').click()
  await page.getByRole('option', { name: 'Faculty of Science', exact: true }).click()

  await welcomeModal.getByTestId('primary-language-option-fi').click()
  await welcomeModal.getByRole('button', { name: 'Done' }).click()
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

    // the mandatory questions start expanded, and they are server side filters
    // without match counts, so answer the course language and open a filter that does have counts
    await page.getByTestId('lang-option-fi').click()
    await filters.getByRole('button', { name: 'Replacement', exact: true }).click()

    const replacement = filters.getByRole('region', { name: 'Replacement' })
    await expect(replacement.getByRole('radio').first()).toBeAttached()

    await expect(replacement.getByRole('radio', { name: /matching courses?$/ }).first()).toBeAttached()
    await expect(replacement.getByRole('radio', { name: /\d$/ })).toHaveCount(0)
  })
})
