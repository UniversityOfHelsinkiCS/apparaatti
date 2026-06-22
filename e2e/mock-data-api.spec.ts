import { expect, test } from '@playwright/test'

test('returns pong from /api/ping', async ({ request }) => {
  const response = await request.get('/api/ping')
  expect(response.status()).toBe(200)
  expect(await response.text()).toBe('pong')
})

test('front page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
})
