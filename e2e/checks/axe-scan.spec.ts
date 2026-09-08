import type { Page } from '@playwright/test'

import { scan, writeAxeReport } from '../axe/axe_utils'
import { expect, test } from '../fixtures'

async function useEnglish(page: Page, scope: Page | ReturnType<Page['getByRole']>) {
  await scope.getByTestId('language-selector').click()
  await page.getByRole('option', { name: 'English', exact: true }).click()
}

async function answerWelcomeModal(page: Page) {
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()

  await useEnglish(page, modal)

  await modal.getByTestId('study-field-select').click()
  await page.getByRole('option').first().click()

  await modal.locator('[data-testid^="primary-language-option-"]').first().click()
  await expect(modal).toBeHidden()
}

test.describe('axe wcag scan', () => {
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings').catch(() => undefined)
  })

  test.afterAll(writeAxeReport)

  test('scan first load, welcome modal open', async ({ page }, testInfo) => {
    await page.goto('/')
    await expect(page.getByRole('dialog')).toBeVisible()

    await scan(page, testInfo.title)
  })

  test('scan onboarded home, sidebar and recommendations', async ({ page }, testInfo) => {
    await page.goto('/')
    await answerWelcomeModal(page)
    await expect(page.getByTestId('sidebar-clear-choices')).toBeVisible()

    await scan(page, testInfo.title)
  })

  test('scan onboarded home, first filter accordion expanded', async ({ page }, testInfo) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    const trigger = page.locator('[data-accordion-heading] button').first()
    await expect(trigger).toBeVisible()
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
      await trigger.click()
    }
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await scan(page, testInfo.title)
  })

  test('scan feedback modal with search-data modal stacked on top', async ({ page }, testInfo) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    await page.getByRole('button', { name: 'Send feedback' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: 'View search data' }).click()
    await expect(page.getByText('Search data preview')).toBeVisible()

    await scan(page, testInfo.title)
  })
})
