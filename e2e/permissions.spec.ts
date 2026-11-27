import type { APIRequestContext } from '@playwright/test'

import { expect, test } from './fixtures'

const SNAPSHOTS_PATH = '/api/admin/filter-config/snapshots'
const SEEDED_USER_ID = 'hy-hlo-135753688'

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'
type Route = { method: Method; path: string }

const SUPERUSER_ONLY: Route[] = [
  { method: 'get', path: '/api/admin/users?search=testi' },
  { method: 'post', path: '/api/admin/debug/cause-error' },
  { method: 'post', path: '/api/admin/filter-config' },
  { method: 'post', path: '/api/admin/filter-config/snapshots/1/overwrite' },
  { method: 'delete', path: '/api/admin/filter-config/snapshots/1' },
  { method: 'get', path: '/api/admin/course-tags/export' },
  { method: 'post', path: '/api/admin/course-tags/import' },
  { method: 'post', path: '/api/admin/course-tags/snapshots/1/overwrite' },
  { method: 'delete', path: '/api/admin/course-tags/snapshots/1' },
  { method: 'get', path: '/api/admin/backend-locales/export' },
  { method: 'post', path: '/api/admin/backend-locales/import' },
  { method: 'delete', path: '/api/admin/backend-locales/e2e-missing-key' },
  { method: 'get', path: '/api/admin/recommendation-codes/export' },
  { method: 'post', path: '/api/admin/recommendation-codes/import' },
  { method: 'post', path: '/api/admin/recommendation-languages' },
  { method: 'put', path: '/api/admin/recommendation-languages/1' },
  { method: 'delete', path: '/api/admin/recommendation-languages/1' },
]

const ADMIN_ONLY: Route[] = [
  { method: 'get', path: '/api/admin/user-feedback' },
  { method: 'delete', path: '/api/admin/user-feedback' },
  { method: 'delete', path: '/api/admin/user-feedback/older-than' },
  { method: 'get', path: '/api/admin/courses?page=1&limit=1' },
  { method: 'get', path: '/api/admin/courses/urns' },
  { method: 'get', path: '/api/admin/updater/runs' },
  { method: 'get', path: '/api/admin/stats' },
  { method: 'get', path: '/api/admin/filter-config' },
  { method: 'get', path: '/api/admin/filter-config/snapshots' },
  { method: 'post', path: '/api/admin/filter-config/snapshots' },
  { method: 'patch', path: '/api/admin/filter-config/reorder' },
  { method: 'get', path: '/api/admin/course-tags' },
  { method: 'post', path: '/api/admin/course-tags/cur-state' },
  { method: 'get', path: '/api/admin/course-tags/courses' },
  { method: 'get', path: '/api/admin/course-tags/course-units' },
  { method: 'post', path: '/api/admin/course-tags/bulk/preview' },
  { method: 'get', path: '/api/admin/course-tags/snapshots' },
  { method: 'post', path: '/api/admin/course-tags/snapshots' },
  { method: 'get', path: '/api/admin/backend-locales' },
  { method: 'post', path: '/api/admin/backend-locales' },
  { method: 'get', path: '/api/admin/recommendation-codes' },
  { method: 'post', path: '/api/admin/recommendation-codes' },
  { method: 'get', path: '/api/admin/recommendation-languages' },
  { method: 'get', path: '/api/debug/reset/settings' },
  { method: 'get', path: '/api/debug/visits' },
  { method: 'get', path: '/api/debug/cur/debug' },
  { method: 'get', path: '/api/debug/cur' },
  { method: 'get', path: '/api/debug/cu' },
  { method: 'get', path: '/api/debug/strict' },
  { method: 'get', path: '/api/debug/curcu' },
]

const call = async (request: APIRequestContext, route: Route) => {
  if (route.method === 'get') return await request.get(route.path)
  return await request.fetch(route.path, { method: route.method.toUpperCase(), data: {} })
}

const label = (route: Route) => `${route.method.toUpperCase()} ${route.path}`

test.describe('a regular admin is refused every superuser route', () => {
  for (const route of SUPERUSER_ONLY) {
    test(label(route), async ({ adminRequest }) => {
      expect((await call(adminRequest, route)).status()).toBe(403)
    })
  }
})

test.describe('a plain user is refused every admin route', () => {
  for (const route of [...ADMIN_ONLY, ...SUPERUSER_ONLY]) {
    test(label(route), async ({ userRequest }) => {
      expect((await call(userRequest, route)).status()).toBe(403)
    })
  }
})

test.describe('a regular admin reaches every admin route', () => {
  for (const route of ADMIN_ONLY) {
    test(label(route), async ({ adminRequest }) => {
      expect((await call(adminRequest, route)).status()).not.toBe(403)
    })
  }
})

test.describe('the updater run type carries its own superuser rule', () => {
  test('a full run is refused for a regular admin', async ({ adminRequest }) => {
    const response = await adminRequest.post('/api/admin/updater/run', { data: { runtype: 'full' } })

    expect(response.status()).toBe(403)
  })

  test('an empty body defaults to a full run and is refused the same way', async ({ adminRequest }) => {
    const response = await adminRequest.post('/api/admin/updater/run', { data: {} })

    expect(response.status()).toBe(403)
  })

  test('a courses run is allowed for a regular admin', async ({ adminRequest }) => {
    const response = await adminRequest.post('/api/admin/updater/run', { data: { runtype: 'courses' } })

    expect(response.status()).not.toBe(403)
  })

  test('a plain user is refused either run type', async ({ userRequest }) => {
    expect((await userRequest.post('/api/admin/updater/run', { data: { runtype: 'courses' } })).status()).toBe(403)
    expect((await userRequest.post('/api/admin/updater/run', { data: { runtype: 'full' } })).status()).toBe(403)
  })
})

test.describe('restricted filter mutations', () => {
  test.describe.configure({ mode: 'serial' })

  let snapshotId: number
  let variantName: string
  let optionId: string

  test.beforeAll(async ({ request, e2eUserId }) => {
    const created = await request.post(SNAPSHOTS_PATH, {
      data: {
        name: `e2e-permissions-${e2eUserId}`,
        description: 'e2e',
        base: { kind: 'published' },
        mutations: { wordings: [] },
      },
    })
    expect(created.status()).toBe(201)
    snapshotId = (await created.json()).id

    const payload = await (await request.get(`${SNAPSHOTS_PATH}/${snapshotId}`)).json()
    const config = payload.filters.find((filter: { id: string }) => filter.id === 'lang')
    variantName = config.variants[0].name
    optionId = config.variants[0].options[0].id
  })

  test.afterAll(async ({ request }) => {
    await request.delete(`${SNAPSHOTS_PATH}/${snapshotId}`)
  })

  const mutate = async (request: APIRequestContext, id: number, settings: unknown[]) =>
    await request.post(`${SNAPSHOTS_PATH}/${id}/mutate`, { data: { mutations: { wordings: [], settings } } })

  test('deleteVariant is restricted', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [{ op: 'deleteVariant', filterId: 'lang', variantName }])

    expect(response.status()).toBe(403)
    expect((await response.json()).restricted).toEqual(['deleteVariant'])
  })

  test('renameVariant is restricted', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [
      { op: 'renameVariant', filterId: 'lang', variantName, newName: 'e2e-renamed' },
    ])

    expect(response.status()).toBe(403)
    expect((await response.json()).restricted).toEqual(['renameVariant'])
  })

  test('variantConditions is restricted', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [
      { op: 'variantConditions', filterId: 'lang', variantName, conditions: {} },
    ])

    expect(response.status()).toBe(403)
    expect((await response.json()).restricted).toEqual(['variantConditions'])
  })

  test('deleteOption is restricted', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [
      { op: 'deleteOption', filterId: 'lang', variantName, optionId },
    ])

    expect(response.status()).toBe(403)
    expect((await response.json()).restricted).toEqual(['deleteOption'])
  })

  test('renaming an option id is restricted', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [
      {
        op: 'optionSettings',
        filterId: 'lang',
        variantName,
        optionId,
        settings: { id: `${optionId}-renamed`, valueOverride: null, selectedByDefault: false },
      },
    ])

    expect(response.status()).toBe(403)
    expect((await response.json()).restricted).toEqual(['optionId'])
  })

  test('coordinateKey is restricted', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [
      { op: 'filterSettings', filterId: 'lang', settings: { coordinateKey: 'e2e-coordinate' } },
    ])

    expect(response.status()).toBe(403)
    expect((await response.json()).restricted).toEqual(['coordinateKey'])
  })

  test('parentFilterId is restricted', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [
      { op: 'filterSettings', filterId: 'lang', settings: { parentFilterId: 'challenge' } },
    ])

    expect(response.status()).toBe(403)
    expect((await response.json()).restricted).toEqual(['parentFilterId'])
  })

  test('a superuser may apply every restricted change', async ({ request }) => {
    const response = await mutate(request, snapshotId, [
      { op: 'variantConditions', filterId: 'lang', variantName, conditions: {} },
      { op: 'filterSettings', filterId: 'lang', settings: { coordinateKey: 'e2e-coordinate', parentFilterId: null } },
      {
        op: 'optionSettings',
        filterId: 'lang',
        variantName,
        optionId,
        settings: { id: `${optionId}-renamed`, valueOverride: null, selectedByDefault: false },
      },
    ])

    expect(response.status()).toBe(200)
  })

  test('an unrestricted change is allowed for a regular admin', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [
      { op: 'variantSkipped', filterId: 'lang', variantName, skipped: false },
    ])

    expect(response.status()).toBe(200)
  })

  test('an option settings change that keeps the id is allowed for a regular admin', async ({ adminRequest }) => {
    const response = await mutate(adminRequest, snapshotId, [
      {
        op: 'optionSettings',
        filterId: 'lang',
        variantName,
        optionId: `${optionId}-renamed`,
        settings: { id: `${optionId}-renamed`, valueOverride: null, selectedByDefault: false },
      },
    ])

    expect(response.status()).toBe(200)
  })
})

test.describe('login as', () => {
  test('a superuser may impersonate another user', async ({ request }) => {
    const response = await request.get('/api/user', { headers: { 'x-login-as': SEEDED_USER_ID } })

    expect((await response.json()).id).toBe(SEEDED_USER_ID)
  })

  test('a regular admin cannot impersonate', async ({ adminRequest, e2eUserId }) => {
    const response = await adminRequest.get('/api/user', { headers: { 'x-login-as': SEEDED_USER_ID } })

    expect((await response.json()).id).toBe(e2eUserId)
  })

  test('a plain user cannot impersonate', async ({ userRequest, e2eUserId }) => {
    const response = await userRequest.get('/api/user', { headers: { 'x-login-as': SEEDED_USER_ID } })

    expect((await response.json()).id).toBe(e2eUserId)
  })

  test('impersonating an unknown id keeps the caller identity', async ({ request, e2eUserId }) => {
    const response = await request.get('/api/user', { headers: { 'x-login-as': 'no-such-user' } })

    expect((await response.json()).id).toBe(e2eUserId)
  })

  test('the login-as page redirects a regular admin away', async ({ browser, e2eUserId }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-e2e-user': e2eUserId, 'x-e2e-role': 'admin' },
    })
    const page = await context.newPage()

    await page.goto('/admin/login-as')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId('login-as-user')).toHaveCount(0)

    await context.close()
  })

  test('the login-as page redirects a plain user away', async ({ browser, e2eUserId }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-e2e-user': e2eUserId, 'x-e2e-role': 'user' },
    })
    const page = await context.newPage()

    await page.goto('/admin/login-as')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId('login-as-user')).toHaveCount(0)

    await context.close()
  })

  test('the login-as page renders its search for a superuser', async ({ page }) => {
    await page.goto('/admin/login-as')

    await expect(page.getByTestId('login-as-user')).toBeVisible()
  })
})
