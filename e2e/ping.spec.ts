import { expect, test } from './fixtures'

test.describe('API ping', () => {
  test('returns pong from /api/ping', async ({ request }) => {
    const response = await request.get('/api/ping')
    expect(response.status()).toBe(200)
    expect(await response.text()).toBe('pong')
  })

  test('a successful ping means the seeded data is queryable', async ({ request }) => {
    expect((await request.get('/api/ping')).status()).toBe(200)

    const courses = await (await request.get('/api/admin/courses?page=1&limit=1')).json()
    expect(courses.total).toBeGreaterThan(0)
  })
})
