import { expect, test } from './fixtures'

const TAGS_PATH = '/api/admin/course-tags'

const workerTagKey = (e2eUserId: string) => `e2e-tag-${e2eUserId}`

const published = { kind: 'published' as const }

const draft = (mutations: Record<string, unknown>) => ({
  base: published,
  mutations: { tags: [], cur: [], cu: [], ...mutations },
})

const curState = async (request: any, curId: string, base: unknown = published) =>
  (await request.post(`${TAGS_PATH}/cur-state`, { data: { curIds: [curId], base } })).json()

const firstCurId = async (request: any, query = '') =>
  (await (await request.get(`/api/admin/courses?page=1&limit=1${query}`)).json()).courses[0].id

test.describe.configure({ mode: 'serial' })

test('the migration ran to completion and seeded the tag vocabulary', async ({ request }) => {
  const tags = await (await request.get(TAGS_PATH)).json()
  const keys = tags.map((tag: any) => tag.key)

  expect(keys).toContain('kks-kor')
  expect(keys).toContain('kkt-mat')
  expect(tags.find((tag: any) => tag.key === 'kks-kor').description).toBeTruthy()
})

test('cur-state returns the premises a client needs to resolve tag state itself', async ({ request }) => {
  const curId = await firstCurId(request)
  const [premises] = await curState(request, curId)

  expect(premises.curId).toBe(curId)
  expect(Array.isArray(premises.cus)).toBe(true)
  expect(Array.isArray(premises.rows)).toBe(true)
})

test('a tag created and applied in one draft becomes live together with its cur row', async ({
  request,
  e2eUserId,
}) => {
  const key = workerTagKey(e2eUserId)
  const curId = await firstCurId(request)

  const before = await (await request.get(TAGS_PATH)).json()
  expect(before.map((tag: any) => tag.key)).not.toContain(key)

  const applied = await request.post(`${TAGS_PATH}/publish`, {
    data: {
      description: 'e2e local draft',
      ...draft({
        tags: [{ op: 'upsert', key, description: 'created by the e2e suite' }],
        cur: [{ curId, tagKey: key, mode: 'add' }],
      }),
    },
  })
  expect(applied.status()).toBe(200)

  const after = await (await request.get(TAGS_PATH)).json()
  expect(after.find((tag: any) => tag.key === key)?.description).toBe('created by the e2e suite')

  const [premises] = await curState(request, curId)
  expect(premises.rows).toContainEqual({ tagKey: key, mode: 'add' })

  await request.post(`${TAGS_PATH}/publish`, {
    data: { description: 'e2e cleanup', ...draft({ tags: [{ op: 'delete', key }] }) },
  })

  const cleaned = await (await request.get(TAGS_PATH)).json()
  expect(cleaned.map((tag: any) => tag.key)).not.toContain(key)
})

test('saving a version leaves the applied tagging untouched', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const curId = await firstCurId(request)

  const created = await request.post(`${TAGS_PATH}/snapshots`, {
    data: {
      name: `e2e unreleased ${e2eUserId}`,
      description: 'e2e',
      ...draft({
        tags: [{ op: 'upsert', key, description: null }],
        cur: [{ curId, tagKey: key, mode: 'add' }],
      }),
    },
  })
  expect(created.status()).toBe(201)
  const snapshot = await created.json()

  const payload = await (await request.get(`${TAGS_PATH}/snapshots/${snapshot.id}`)).json()
  expect(payload.curTags).toContainEqual({ curId, tagKey: key, mode: 'add' })

  const live = await (await request.get(TAGS_PATH)).json()
  expect(live.map((tag: any) => tag.key)).not.toContain(key)

  const [premises] = await curState(request, curId)
  expect(premises.rows.map((row: any) => row.tagKey)).not.toContain(key)

  const [fromVersion] = await curState(request, curId, { kind: 'snapshot', id: snapshot.id })
  expect(fromVersion.rows).toContainEqual({ tagKey: key, mode: 'add' })

  expect((await request.delete(`${TAGS_PATH}/snapshots/${snapshot.id}`)).status()).toBe(200)
})

test('saving into the version being edited overwrites it instead of creating a new one', async ({
  request,
  e2eUserId,
}) => {
  const key = workerTagKey(e2eUserId)
  const curId = await firstCurId(request)

  const version = await (
    await request.post(`${TAGS_PATH}/snapshots`, {
      data: { name: `syksyn versio ${e2eUserId}`, description: 'e2e', ...draft({}) },
    })
  ).json()

  const countBefore = (await (await request.get(`${TAGS_PATH}/snapshots`)).json()).length

  const overwritten = await request.post(`${TAGS_PATH}/snapshots/${version.id}/overwrite`, {
    data: {
      name: `syksyn versio ${e2eUserId}`,
      description: 'edited in place',
      base: { kind: 'snapshot', id: version.id },
      mutations: {
        tags: [{ op: 'upsert', key, description: null }],
        cur: [{ curId, tagKey: key, mode: 'add' }],
        cu: [],
      },
    },
  })
  expect(overwritten.status()).toBe(200)

  const snapshots = await (await request.get(`${TAGS_PATH}/snapshots`)).json()
  expect(snapshots).toHaveLength(countBefore)
  expect(snapshots.find((row: any) => row.id === version.id).description).toBe('edited in place')

  const payload = await (await request.get(`${TAGS_PATH}/snapshots/${version.id}`)).json()
  expect(payload.curTags).toContainEqual({ curId, tagKey: key, mode: 'add' })

  await request.delete(`${TAGS_PATH}/snapshots/${version.id}`)
})

test('a course unit tag applied in a draft is inherited by its realisations', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const units = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=1`)).json()
  const group = units.groups[0]
  const curId = await firstCurId(request, `&courseCode=${group.courseCode}`)

  await request.post(`${TAGS_PATH}/publish`, {
    data: {
      description: 'e2e cu tag',
      ...draft({
        tags: [{ op: 'upsert', key, description: null }],
        cu: [{ courseCode: group.courseCode, cuIds: group.cuIds, tagKey: key, present: true }],
      }),
    },
  })

  const tagged = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=1`)).json()
  expect(tagged.groups[0].tagKeys).toContain(key)

  const [premises] = await curState(request, curId)
  expect(premises.cus.flatMap((cu: any) => cu.tagKeys)).toContain(key)

  await request.post(`${TAGS_PATH}/publish`, {
    data: { description: 'e2e cleanup', ...draft({ tags: [{ op: 'delete', key }] }) },
  })
})

test('each course unit appears exactly once in the course unit matrix', async ({ request }) => {
  const units = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=200`)).json()
  const codes = units.groups.map((group: any) => group.courseCode)

  expect(codes).toHaveLength(new Set(codes).size)
  expect(units.groups.every((group: any) => group.realisationCount > 0)).toBe(true)
})

test('the bulk preview returns the matching ids the client folds into its draft', async ({ request }) => {
  const filters = { courseCode: 'KK-' }
  const listing = await (await request.get('/api/admin/courses?page=1&limit=1&courseCode=KK-')).json()

  const preview = await (
    await request.post(`${TAGS_PATH}/bulk/preview`, { data: { filters, tagKeys: ['kks-kor'], mode: 'add' } })
  ).json()

  expect(preview.matched).toBe(listing.total)
  expect(preview.curIds).toHaveLength(listing.total)
})

test('publishing records an automatic version', async ({ request }) => {
  const before = await (await request.get(`${TAGS_PATH}/snapshots`)).json()

  await request.post(`${TAGS_PATH}/publish`, { data: { description: 'e2e no-op apply', ...draft({}) } })

  const after = await (await request.get(`${TAGS_PATH}/snapshots`)).json()
  expect(after.length).toBe(before.length + 1)
})

test('the export is a downloadable json attachment', async ({ request }) => {
  const response = await request.get(`${TAGS_PATH}/export`)

  expect(response.status()).toBe(200)
  expect(response.headers()['content-disposition']).toContain('course-tags-')
  expect(await response.json()).toHaveProperty('curTags')
})

test('the tags admin page renders its tabs', async ({ page }) => {
  await page.goto('/admin/course-tags')

  await expect(page.getByRole('tab', { name: 'Toteutukset' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Opintojaksot' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Versiot' })).toBeVisible()
})
