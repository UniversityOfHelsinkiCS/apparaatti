import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'

const THEOLOGY = 'Faculty of Theology'

const ADDITIONAL_INFO_KEY = 'noRecommendations.additionalInfo'

async function answerWelcomeModal(page: Page) {
  const welcomeModal = page.getByRole('dialog')
  await expect(welcomeModal).toBeVisible()

  await welcomeModal.getByTestId('language-selector').click()
  await page.getByRole('option', { name: 'English', exact: true }).click()

  await welcomeModal.getByTestId('study-field-select').click()
  await page.getByRole('option', { name: THEOLOGY, exact: true }).click()

  await welcomeModal.getByTestId('primary-language-option-fi').click()
  await expect(welcomeModal).toBeHidden()
}

// Faculty of Theology + course language === school language matches zero seeded courses,
// which is the only state where the additional info text renders.
async function reachEmptyState(page: Page) {
  await page.goto('/')
  await answerWelcomeModal(page)

  await page.getByTestId('lang-option-fi').click()
  await page.getByTestId('primary-language-specification-option-writtenAndSpoken').click()

  await expect(page.getByTestId('no-recommendations-heading')).toBeVisible()
}

test.describe('backend locales on the empty state', () => {
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings')
  })

  test('renders the resolved text as markdown under the empty state', async ({ page }) => {
    await page.route('**/api/backend-locales*', route =>
      route.fulfill({
        json: {
          locales: {
            [ADDITIONAL_INFO_KEY]: {
              fi: 'Ota yhteyttä [tiedekuntaan](https://example.com/fi).',
              sv: 'Kontakta [fakulteten](https://example.com/sv).',
              en: 'Please contact [the faculty](https://example.com/en).',
            },
          },
        },
      })
    )

    await reachEmptyState(page)

    await expect(page.getByText('Please contact')).toBeVisible()
    const link = page.getByRole('link', { name: /the faculty/ })
    await expect(link).toHaveAttribute('href', 'https://example.com/en')
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('issues one request per filter context and reuses the cache', async ({ page }) => {
    const requestedUrls: string[] = []

    await page.route('**/api/backend-locales*', route => {
      requestedUrls.push(route.request().url())
      return route.fulfill({ json: { locales: { [ADDITIONAL_INFO_KEY]: null } } })
    })

    await reachEmptyState(page)

    // The provider is mounted once, so each distinct filter context fetches at most once.
    // Duplicate URLs would mean a re-render triggered a second identical request.
    expect(new Set(requestedUrls).size).toBe(requestedUrls.length)
  })

  test('logs an actionable error and renders nothing when no text matches', async ({ page }) => {
    const errors: string[] = []
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text())
    })

    await page.route('**/api/backend-locales*', route =>
      route.fulfill({ json: { locales: { [ADDITIONAL_INFO_KEY]: null } } })
    )

    await reachEmptyState(page)

    await expect(page.getByRole('link', { name: /the faculty/ })).toHaveCount(0)
    await expect
      .poll(() => errors.some(error => error.includes('has no text matching') && error.includes(ADDITIONAL_INFO_KEY)))
      .toBe(true)
  })

  test('logs a different error when the key does not exist', async ({ page }) => {
    const errors: string[] = []
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text())
    })

    await page.route('**/api/backend-locales*', route => route.fulfill({ json: { locales: {} } }))

    await reachEmptyState(page)

    await expect(page.getByRole('link', { name: /the faculty/ })).toHaveCount(0)
    await expect
      .poll(() => errors.some(error => error.includes('does not exist') && error.includes(ADDITIONAL_INFO_KEY)))
      .toBe(true)
  })
})
