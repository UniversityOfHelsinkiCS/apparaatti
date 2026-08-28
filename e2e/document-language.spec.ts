import { expect, type Page, test } from '@playwright/test'

const htmlLang = (page: Page) => page.locator('html')

async function selectLanguage(page: Page, optionLabel: string) {
  await page.getByRole('dialog').getByTestId('language-selector').click()
  await page.getByRole('option', { name: optionLabel, exact: true }).click()
}

test.describe('document language', () => {
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings')
  })

  test('html lang follows the selected language and survives a reload', async ({ page }) => {
    await page.goto('/')

    await expect(htmlLang(page)).toHaveAttribute('lang', 'fi')

    await selectLanguage(page, 'English')
    await expect(htmlLang(page)).toHaveAttribute('lang', 'en')

    await selectLanguage(page, 'Svenska')
    await expect(htmlLang(page)).toHaveAttribute('lang', 'sv')

    await page.reload()
    await expect(htmlLang(page)).toHaveAttribute('lang', 'sv')
  })
})
