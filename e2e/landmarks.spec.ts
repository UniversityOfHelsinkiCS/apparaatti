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
  await expect(welcomeModal).toBeHidden()
}

test.describe('landmarks', () => {
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

  test('the drawer toggle reports the sidebar state', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    await page.goto('/')
    await answerWelcomeModal(page)

    const toggle = page.getByTestId('drawer-toggle')
    await expect(toggle).toHaveAttribute('aria-controls', 'filters-region')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle).toHaveAttribute('aria-label', 'Close filters')

    await page.getByTestId('sidebar-close').click()

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toHaveAttribute('aria-label', 'Open filters')

    await toggle.click()

    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle).toHaveAttribute('aria-label', 'Close filters')
  })

  test('filter questions are announced with their options', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    const filters = page.getByRole('navigation', { name: 'Course filters' })
    const question = filters.getByTestId('question-text-lang')
    await expect(question).toHaveText('What language are you looking for?')
    await expect(question).not.toHaveAttribute('tabindex')

    await expect(filters.getByRole('radiogroup').first()).toHaveAccessibleName(
      'What language are you looking for?'
    )
  })

  test('the app is described for screen readers', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    const description = page.getByTestId('app-description')
    await expect(description).toContainText('Polku is the University of Helsinki Language Centre course recommender.')
    await expect(description).toHaveAttribute('id', 'app-description')

    const title = page.getByTestId('app-title')
    await expect(title).toHaveAttribute('aria-describedby', 'app-description')

    await expect(title).not.toHaveAttribute('tabindex')

    await page.locator('body').press('Tab')
    await expect(title).not.toBeFocused()
  })
})
