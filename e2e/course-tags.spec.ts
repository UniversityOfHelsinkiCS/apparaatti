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

const createVersion = async (request: any, name: string, mutations: Record<string, unknown> = {}) =>
  await (
    await request.post(`${TAGS_PATH}/snapshots`, { data: { name, description: 'e2e', ...draft(mutations) } })
  ).json()

const applyAsVersion = async (request: any, name: string, mutations: Record<string, unknown>) => {
  const created = await createVersion(request, name, mutations)
  expect((await request.post(`${TAGS_PATH}/snapshots/${created.id}/activate`)).status()).toBe(200)
  await request.delete(`${TAGS_PATH}/snapshots/${created.id}`)
}

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

test('a tag created and activated on one version becomes live with its cur row', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const curId = await firstCurId(request)

  const before = await (await request.get(TAGS_PATH)).json()
  expect(before.map((tag: any) => tag.key)).not.toContain(key)

  await applyAsVersion(request, `e2e apply ${e2eUserId}`, {
    tags: [{ op: 'upsert', key, description: 'created by the e2e suite' }],
    cur: [{ curId, tagKey: key, mode: 'add' }],
  })

  const after = await (await request.get(TAGS_PATH)).json()
  expect(after.find((tag: any) => tag.key === key)?.description).toBe('created by the e2e suite')

  const [premises] = await curState(request, curId)
  expect(premises.rows).toContainEqual({ tagKey: key, mode: 'add' })

  await applyAsVersion(request, `e2e cleanup ${e2eUserId}`, { tags: [{ op: 'delete', key }] })

  const cleaned = await (await request.get(TAGS_PATH)).json()
  expect(cleaned.map((tag: any) => tag.key)).not.toContain(key)
})

test('each toggle is written straight into the edited version', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const curId = await firstCurId(request)
  const version = await createVersion(request, `e2e mutate ${e2eUserId}`)

  const upsert = await request.post(`${TAGS_PATH}/snapshots/${version.id}/mutate`, {
    data: { mutations: { tags: [{ op: 'upsert', key, description: null }], cur: [], cu: [] } },
  })
  expect(upsert.status()).toBe(200)

  await request.post(`${TAGS_PATH}/snapshots/${version.id}/mutate`, {
    data: { mutations: { tags: [], cur: [{ curId, tagKey: key, mode: 'add' }], cu: [] } },
  })

  const [fromVersion] = await curState(request, curId, { kind: 'snapshot', id: version.id })
  expect(fromVersion.rows).toContainEqual({ tagKey: key, mode: 'add' })

  const live = await (await request.get(TAGS_PATH)).json()
  expect(live.map((tag: any) => tag.key)).not.toContain(key)

  await request.post(`${TAGS_PATH}/snapshots/${version.id}/mutate`, {
    data: { mutations: { tags: [], cur: [{ curId, tagKey: key, mode: 'clear' }], cu: [] } },
  })

  const [cleared] = await curState(request, curId, { kind: 'snapshot', id: version.id })
  expect(cleared.rows.map((row: any) => row.tagKey)).not.toContain(key)

  expect(
    (await request.post(`${TAGS_PATH}/snapshots/999999/mutate`, { data: { mutations: draft({}).mutations } })).status()
  ).toBe(404)

  await request.delete(`${TAGS_PATH}/snapshots/${version.id}`)
})

test('a version being edited leaves the applied tagging untouched', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const curId = await firstCurId(request)

  const snapshot = await createVersion(request, `e2e unreleased ${e2eUserId}`, {
    tags: [{ op: 'upsert', key, description: null }],
    cur: [{ curId, tagKey: key, mode: 'add' }],
  })

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

test('a course unit tag applied on a version is inherited by its realisations', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const units = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=1`)).json()
  const group = units.groups[0]
  const curId = await firstCurId(request, `&courseCode=${group.courseCode}`)

  await applyAsVersion(request, `e2e cu tag ${e2eUserId}`, {
    tags: [{ op: 'upsert', key, description: null }],
    cu: [{ courseCode: group.courseCode, cuIds: group.cuIds, tagKey: key, present: true }],
  })

  const tagged = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=1`)).json()
  expect(tagged.groups[0].tagKeys).toContain(key)

  const [premises] = await curState(request, curId)
  expect(premises.cus.flatMap((cu: any) => cu.tagKeys)).toContain(key)

  await applyAsVersion(request, `e2e cu cleanup ${e2eUserId}`, { tags: [{ op: 'delete', key }] })
})

test('each course unit appears exactly once in the course unit matrix', async ({ request }) => {
  const units = await (await request.get(`${TAGS_PATH}/course-units?page=1&limit=200`)).json()
  const codes = units.groups.map((group: any) => group.courseCode)

  expect(codes).toHaveLength(new Set(codes).size)
  expect(units.groups.every((group: any) => group.realisationCount > 0)).toBe(true)
})

test('the bulk preview returns the matching ids of the version being edited', async ({ request }) => {
  const filters = { courseCode: 'KK-' }
  const listing = await (await request.get('/api/admin/courses?page=1&limit=1&courseCode=KK-')).json()

  const preview = await (
    await request.post(`${TAGS_PATH}/bulk/preview`, {
      data: { filters, base: published, tagKeys: ['kks-kor'], mode: 'add' },
    })
  ).json()

  expect(preview.matched).toBe(listing.total)
  expect(preview.curIds).toHaveLength(listing.total)
})

test('activating a version marks that version in use without duplicating it', async ({ request, e2eUserId }) => {
  const created = await createVersion(request, `e2e activate ${e2eUserId}`)

  const before = await (await request.get(`${TAGS_PATH}/snapshots`)).json()
  expect((await request.post(`${TAGS_PATH}/snapshots/${created.id}/activate`)).status()).toBe(200)

  const after = await (await request.get(`${TAGS_PATH}/snapshots`)).json()
  expect(after.length).toBe(before.length)

  const active = after.filter((row: any) => row.isActive)
  expect(active).toHaveLength(1)
  expect(active[0].id).toBe(created.id)

  await request.delete(`${TAGS_PATH}/snapshots/${created.id}`)
})

test('editing the version in use stops it claiming to be in use', async ({ request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const created = await createVersion(request, `e2e edit active ${e2eUserId}`)

  await request.post(`${TAGS_PATH}/snapshots/${created.id}/activate`)
  expect(
    (await (await request.get(`${TAGS_PATH}/snapshots`)).json()).find((r: any) => r.id === created.id).isActive
  ).toBe(true)

  await request.post(`${TAGS_PATH}/snapshots/${created.id}/mutate`, {
    data: { mutations: { tags: [{ op: 'upsert', key, description: null }], cur: [], cu: [] } },
  })

  const after = await (await request.get(`${TAGS_PATH}/snapshots`)).json()
  expect(after.find((row: any) => row.id === created.id).isActive).toBe(false)

  await request.delete(`${TAGS_PATH}/snapshots/${created.id}`)
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

test('a version cannot be published without the diff review on screen', async ({ page, request, e2eUserId }) => {
  const key = workerTagKey(e2eUserId)
  const curId = await firstCurId(request)
  const version = await createVersion(request, `e2e review ${e2eUserId}`, {
    tags: [{ op: 'upsert', key, description: null }],
    cur: [{ curId, tagKey: key, mode: 'add' }],
  })

  const isActive = async () =>
    (await (await request.get(`${TAGS_PATH}/snapshots`)).json()).find((row: any) => row.id === version.id).isActive

  const publishDiff = await (await request.get(`${TAGS_PATH}/snapshots/${version.id}/publish-diff`)).json()
  expect(publishDiff.addedTags).toContain(key)
  expect(publishDiff.addedCurTags).toContainEqual({ curId, tagKey: key, mode: 'add' })
  expect(publishDiff.removedCurTags).not.toContainEqual({ curId, tagKey: key, mode: 'add' })

  await page.goto('/admin/course-tags')
  await page.getByLabel('Muokattavana').click()
  await page.getByRole('option', { name: `e2e review ${e2eUserId}` }).click()

  await page.getByRole('button', { name: 'Tarkista ja ota käyttöön' }).click()

  const review = page.getByRole('dialog')
  await expect(review.getByText('Tarkista muutokset ennen käyttöönottoa')).toBeVisible()
  expect(await isActive(), 'opening the review must not publish anything').toBe(false)

  await review.getByRole('button', { name: 'Ota muutokset käyttöön' }).click()
  await expect.poll(isActive).toBe(true)

  await request.delete(`${TAGS_PATH}/snapshots/${version.id}`)
  await applyAsVersion(request, `e2e review cleanup ${e2eUserId}`, { tags: [{ op: 'delete', key }] })
})

test.describe('the tag search matches tags, the urn filter matches sisu urns', () => {
  const TAG = 'kks-alm'

  const listing = async (request: any, params: Record<string, string>) =>
    (await request.get(`/api/admin/courses?${new URLSearchParams({ page: '1', limit: '500', ...params })}`)).json()

  const tagListing = async (request: any, params: Record<string, string>) =>
    (
      await request.get(
        `${TAGS_PATH}/courses?${new URLSearchParams({ page: '1', limit: '500', base: 'published', ...params })}`
      )
    ).json()

  const urnsOf = (course: any) =>
    Object.values((course.customCodeUrns ?? {}) as Record<string, string[]>)
      .flat()
      .join(' ')

  const applyTag = (request: any, mutations: Record<string, unknown>) =>
    applyAsVersion(request, `e2e filter coverage ${Date.now()}`, mutations)

  test('a tag with no matching sisu urn is still seen by the exclude and include filters', async ({ request }) => {
    const all = await listing(request, {})
    const target = all.courses.find((course: any) => !urnsOf(course).includes(TAG))
    expect(target, 'seed needs a course without the tag urn').toBeTruthy()

    await applyTag(request, {
      tags: [{ op: 'upsert', key: TAG, description: null }],
      cur: [{ curId: target.id, tagKey: TAG, mode: 'add' }],
    })

    const excluded = await listing(request, { excludeUrns: TAG })
    expect(excluded.courses.some((course: any) => course.id === target.id)).toBe(false)

    const included = await listing(request, { urn: TAG })
    expect(included.courses.some((course: any) => course.id === target.id)).toBe(true)

    await applyTag(request, { cur: [{ curId: target.id, tagKey: TAG, mode: 'clear' }] })

    const restored = await listing(request, { excludeUrns: TAG })
    expect(restored.courses.some((course: any) => course.id === target.id)).toBe(true)
  })

  test('a tag ignored on a realisation is not treated as present by the filters', async ({ request }) => {
    const all = await listing(request, {})
    const target = all.courses.find((course: any) => !urnsOf(course).includes(TAG))

    await applyTag(request, {
      tags: [{ op: 'upsert', key: TAG, description: null }],
      cur: [{ curId: target.id, tagKey: TAG, mode: 'ignore' }],
    })

    const included = await listing(request, { urn: TAG })
    expect(included.courses.some((course: any) => course.id === target.id)).toBe(false)

    await applyTag(request, { cur: [{ curId: target.id, tagKey: TAG, mode: 'clear' }] })
  })

  test('the tag search finds a tagged course but never a raw sisu urn', async ({ request }) => {
    const all = await listing(request, {})
    const target = all.courses.find((course: any) => !urnsOf(course).includes(TAG) && urnsOf(course).length > 0)
    expect(target, 'seed needs a course carrying sisu urns but not the tag').toBeTruthy()
    const sisuUrn = urnsOf(target).split(' ')[0]

    await applyTag(request, {
      tags: [{ op: 'upsert', key: TAG, description: null }],
      cur: [{ curId: target.id, tagKey: TAG, mode: 'add' }],
    })

    const byTag = await tagListing(request, { tags: TAG })
    expect(byTag.courses.some((course: any) => course.id === target.id)).toBe(true)

    const bySisuUrn = await tagListing(request, { tags: sisuUrn })
    expect(bySisuUrn.courses.some((course: any) => course.id === target.id)).toBe(false)

    const excluded = await tagListing(request, { excludeTags: TAG })
    expect(excluded.courses.some((course: any) => course.id === target.id)).toBe(false)

    const onCoursesPage = await listing(request, { urn: sisuUrn })
    expect(onCoursesPage.courses.some((course: any) => course.id === target.id)).toBe(true)

    await applyTag(request, { cur: [{ curId: target.id, tagKey: TAG, mode: 'clear' }] })
  })

  test('the tag search reads the version it is pointed at', async ({ request, e2eUserId }) => {
    const key = workerTagKey(e2eUserId)
    const target = await firstCurId(request)
    const version = await createVersion(request, `e2e search version ${e2eUserId}`, {
      tags: [{ op: 'upsert', key, description: null }],
      cur: [{ curId: target, tagKey: key, mode: 'add' }],
    })

    const fromVersion = await (
      await request.get(
        `${TAGS_PATH}/courses?page=1&limit=500&tags=${key}&base=${encodeURIComponent(`snapshot:${version.id}`)}`
      )
    ).json()
    expect(fromVersion.courses.some((course: any) => course.id === target)).toBe(true)

    const fromPublished = await tagListing(request, { tags: key })
    expect(fromPublished.courses.some((course: any) => course.id === target)).toBe(false)

    await request.delete(`${TAGS_PATH}/snapshots/${version.id}`)
  })
})
