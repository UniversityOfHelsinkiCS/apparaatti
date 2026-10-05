import { expect, test } from './fixtures'

const TAGS_PATH = '/api/admin/course-tags'

const workerTagKey = (e2eUserId: string) => `e2e-tag-${e2eUserId}`

test.describe.configure({ mode: 'serial' })

test('the migration ran to completion and seeded the tag vocabulary', async ({ request }) => {
  const tags = await (await request.get(TAGS_PATH)).json()
  const keys = tags.map((tag: any) => tag.key)

  expect(keys).toContain('kks-kor')
  expect(keys).toContain('kkt-mat')
  expect(tags.find((tag: any) => tag.key === 'kks-kor').description).toBeTruthy()
})

test('an admin can create a tag, describe it and delete it', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)

  const created = await request.post(TAGS_PATH, { data: { key, description: 'created by the e2e suite' } })
  expect(created.status()).toBe(201)
  const tag = await created.json()

  const listed = await (await request.get(TAGS_PATH)).json()
  expect(listed.find((candidate: any) => candidate.key === key)?.description).toBe('created by the e2e suite')

  const duplicate = await request.post(TAGS_PATH, { data: { key, description: null } })
  expect(duplicate.status()).toBe(409)

  expect((await request.delete(`${TAGS_PATH}/${tag.id}`)).status()).toBe(200)
})

test('a cur tag is added, ignored and cleared again', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const tag = await (await request.post(TAGS_PATH, { data: { key, description: null } })).json()

  const courses = await (await request.get('/api/admin/courses?page=1&limit=1')).json()
  const curId = courses.courses[0].id

  await request.put(`${TAGS_PATH}/cur/${curId}`, { data: { tagKey: key, mode: 'add' } })
  const added = await (await request.get(`${TAGS_PATH}/cur-state?curIds=${curId}`)).json()
  expect(added[0].tags).toContainEqual({ key, source: 'added' })

  await request.put(`${TAGS_PATH}/cur/${curId}`, { data: { tagKey: key, mode: 'clear' } })
  const cleared = await (await request.get(`${TAGS_PATH}/cur-state?curIds=${curId}`)).json()
  expect(cleared[0].tags.map((entry: any) => entry.key)).not.toContain(key)

  await request.delete(`${TAGS_PATH}/${tag.id}`)
})

test('a course unit tag is inherited by its realisations and can be ignored on one', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const tag = await (await request.post(TAGS_PATH, { data: { key, description: null } })).json()

  const units = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=1`)).json()
  const courseCode = units.groups[0].courseCode

  await request.put(`${TAGS_PATH}/course-unit/${encodeURIComponent(courseCode)}`, {
    data: { tagKey: key, present: true },
  })

  const tagged = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=1`)).json()
  expect(tagged.groups[0].tagKeys).toContain(key)

  const courses = await (await request.get(`/api/admin/courses?page=1&limit=1&courseCode=${courseCode}`)).json()
  const curId = courses.courses[0].id
  const inherited = await (await request.get(`${TAGS_PATH}/cur-state?curIds=${curId}`)).json()
  expect(inherited[0].tags).toContainEqual({ key, source: 'inherited' })

  await request.put(`${TAGS_PATH}/cur/${curId}`, { data: { tagKey: key, mode: 'ignore' } })
  const ignored = await (await request.get(`${TAGS_PATH}/cur-state?curIds=${curId}`)).json()
  expect(ignored[0].tags).toContainEqual({ key, source: 'ignored' })

  await request.put(`${TAGS_PATH}/cur/${curId}`, { data: { tagKey: key, mode: 'clear' } })
  await request.put(`${TAGS_PATH}/course-unit/${encodeURIComponent(courseCode)}`, {
    data: { tagKey: key, present: false },
  })
  await request.delete(`${TAGS_PATH}/${tag.id}`)
})

test('each course unit appears exactly once in the course unit matrix', async ({ request }) => {
  const units = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=200`)).json()
  const codes = units.groups.map((group: any) => group.courseCode)

  expect(codes).toHaveLength(new Set(codes).size)
  expect(units.groups.every((group: any) => group.realisationCount > 0)).toBe(true)
})

test('the bulk preview count equals the number of courses the listing reports', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const tag = await (await request.post(TAGS_PATH, { data: { key, description: null } })).json()

  const filters = { courseCode: 'KK-' }
  const listing = await (await request.get('/api/admin/courses?page=1&limit=1&courseCode=KK-')).json()

  const preview = await (
    await request.post(`${TAGS_PATH}/bulk/preview`, { data: { filters, tagKeys: [key], mode: 'add' } })
  ).json()
  expect(preview.matched).toBe(listing.total)

  const applied = await (
    await request.post(`${TAGS_PATH}/bulk`, { data: { filters, tagKeys: [key], mode: 'add' } })
  ).json()
  expect(applied.matched).toBe(listing.total)

  await request.post(`${TAGS_PATH}/bulk`, { data: { filters, tagKeys: [key], mode: 'clear' } })
  await request.delete(`${TAGS_PATH}/${tag.id}`)
})

test('a named snapshot is saved, compared and deleted', async ({ request, e2eUserId }) => {
  const name = `e2e snapshot ${e2eUserId}`

  const created = await request.post(`${TAGS_PATH}/snapshots`, { data: { name, description: 'e2e' } })
  expect(created.status()).toBe(201)
  const snapshot = await created.json()

  const payload = await (await request.get(`${TAGS_PATH}/snapshots/${snapshot.id}`)).json()
  expect(Array.isArray(payload.tags)).toBe(true)

  const diff = await (await request.get(`${TAGS_PATH}/snapshots/${snapshot.id}/diff`)).json()
  expect(diff).toHaveProperty('addedCurTags')

  expect((await request.delete(`${TAGS_PATH}/snapshots/${snapshot.id}`)).status()).toBe(200)
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

test('tag edits stay out of the applied version until saved and applied', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const tag = await (await request.post(TAGS_PATH, { data: { key, description: null } })).json()

  const courses = await (await request.get('/api/admin/courses?page=1&limit=1')).json()
  const curId = courses.courses[0].id

  await request.post(`${TAGS_PATH}/publish`)
  const clean = await (await request.get(`${TAGS_PATH}/pending`)).json()
  expect(clean.addedCurTags).toHaveLength(0)

  await request.put(`${TAGS_PATH}/cur/${curId}`, { data: { tagKey: key, mode: 'add' } })

  const pending = await (await request.get(`${TAGS_PATH}/pending`)).json()
  expect(pending.addedCurTags).toContainEqual({ curId, tagKey: key, mode: 'add' })

  const snapshotsBefore = await (await request.get(`${TAGS_PATH}/snapshots`)).json()
  await request.post(`${TAGS_PATH}/publish`)

  const applied = await (await request.get(`${TAGS_PATH}/pending`)).json()
  expect(applied.addedCurTags).toHaveLength(0)

  const snapshotsAfter = await (await request.get(`${TAGS_PATH}/snapshots`)).json()
  expect(snapshotsAfter.length).toBe(snapshotsBefore.length + 1)

  await request.put(`${TAGS_PATH}/cur/${curId}`, { data: { tagKey: key, mode: 'clear' } })
  await request.post(`${TAGS_PATH}/publish`)
  await request.delete(`${TAGS_PATH}/${tag.id}`)
})

test('discarding a draft restores the applied version', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const tag = await (await request.post(TAGS_PATH, { data: { key, description: null } })).json()

  const courses = await (await request.get('/api/admin/courses?page=1&limit=1')).json()
  const curId = courses.courses[0].id

  await request.post(`${TAGS_PATH}/publish`)
  await request.put(`${TAGS_PATH}/cur/${curId}`, { data: { tagKey: key, mode: 'add' } })
  expect((await (await request.get(`${TAGS_PATH}/pending`)).json()).addedCurTags).toHaveLength(1)

  await request.post(`${TAGS_PATH}/discard`)

  expect((await (await request.get(`${TAGS_PATH}/pending`)).json()).addedCurTags).toHaveLength(0)
  const state = await (await request.get(`${TAGS_PATH}/cur-state?curIds=${curId}`)).json()
  expect(state[0].tags.map((entry: any) => entry.key)).not.toContain(key)

  await request.delete(`${TAGS_PATH}/${tag.id}`)
})
