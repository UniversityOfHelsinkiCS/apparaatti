import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'

const FACULTY = {
  science: 'Faculty of Science',
  theology: 'Faculty of Theology',
}

async function answerWelcomeModal(page: Page, faculty: string, primaryLanguage: 'fi' | 'sv') {
  const welcomeModal = page.getByRole('dialog')
  await expect(welcomeModal).toBeVisible()

  await welcomeModal.getByTestId('language-selector').click()
  await page.getByRole('option', { name: 'English', exact: true }).click()

  await welcomeModal.getByTestId('study-field-select').click()
  await page.getByRole('option', { name: faculty, exact: true }).click()

  await welcomeModal.getByTestId(`primary-language-option-${primaryLanguage}`).click()
  await expect(welcomeModal).toBeHidden()
}

const resultsRegion = (page: Page) => page.getByRole('region', { name: 'Course recommendations' })

test.describe('course recommendation announcements', () => {
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings')
  })

  test('the results region announces the course count and exposes the courses as a list', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page, FACULTY.science, 'fi')

    await page.getByTestId('lang-option-sv').click()

    const region = resultsRegion(page)
    await expect(region).toBeAttached()
    await expect(region.getByRole('status')).toHaveText('10 courses found')

    const list = region.getByRole('list')
    await expect(list).toBeAttached()
    await expect(list.getByRole('listitem')).toHaveCount(10)
  })

  test('the results region announces the empty state', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page, FACULTY.theology, 'fi')

    await page.getByTestId('lang-option-fi').click()
    await page.getByTestId('primary-language-specification-option-writtenAndSpoken').click()

    await expect(page.getByTestId('no-recommendations-heading')).toBeVisible()
    await expect(resultsRegion(page).getByRole('status')).toHaveText('0 courses found')
  })
})
