import { expect, test } from './fixtures'

const COURSES_PATH = '/api/admin/courses'

const search = async (request: any, params: Record<string, string>) => {
  const query = new URLSearchParams({ page: '1', limit: '500', ...params }).toString()
  return (await request.get(`${COURSES_PATH}?${query}`)).json()
}

let baseline: any = null

const unfiltered = async (request: any) => {
  if (!baseline) baseline = await search(request, {})
  return baseline
}

const codesOf = (course: any): string[] => (course.Cus ?? []).map((cu: any) => cu.courseCode)

const urnsOf = (course: any): string[] =>
  Object.values((course.customCodeUrns ?? {}) as Record<string, string[]>).flat()

test.describe.configure({ mode: 'serial' })

test('the admin course listing only surfaces KK- coded courses', async ({ request }) => {
  const all = await unfiltered(request)

  expect(all.total).toBeGreaterThan(0)
  expect(all.courses.every((course: any) => codesOf(course).some(code => code.startsWith('KK-')))).toBe(true)
})

test('excludeCourseCodes drops every course that has a matching course unit', async ({ request }) => {
  const all = await unfiltered(request)
  const excluded = codesOf(all.courses[0])[0]
  expect(excluded).toBeTruthy()

  const filtered = await search(request, { excludeCourseCodes: excluded })

  expect(filtered.total).toBeLessThan(all.total)
  expect(filtered.courses.some((course: any) => codesOf(course).includes(excluded))).toBe(false)
})

test('excludeCourseCodes matches as a case-insensitive substring', async ({ request }) => {
  const all = await unfiltered(request)
  const lower = await search(request, { excludeCourseCodes: 'kk-' })
  const upper = await search(request, { excludeCourseCodes: 'KK-' })

  expect(all.total).toBeGreaterThan(0)
  expect(lower.total).toBe(0)
  expect(upper.total).toBe(0)
})

test('excludeCourseCodes removes a course even when only one of its units matches', async ({ request }) => {
  const all = await unfiltered(request)
  const multiUnit = all.courses.find((course: any) => codesOf(course).length > 1)
  test.skip(!multiUnit, 'seed data has no course with several course units')

  const oneCode = codesOf(multiUnit)[0]
  const filtered = await search(request, { excludeCourseCodes: oneCode })

  expect(filtered.courses.some((course: any) => course.id === multiUnit.id)).toBe(false)
})

test('excludeUrns drops courses carrying the urn', async ({ request }) => {
  const all = await unfiltered(request)
  const withUrns = all.courses.find((course: any) => urnsOf(course).length > 0)
  test.skip(!withUrns, 'seed data has no course with custom code urns')

  const urn = urnsOf(withUrns)[0]
  const filtered = await search(request, { excludeUrns: urn })

  expect(filtered.total).toBeLessThan(all.total)
  expect(filtered.courses.some((course: any) => urnsOf(course).includes(urn))).toBe(false)
})

test('excludeUrns is the exact complement of the include filter', async ({ request }) => {
  const all = await unfiltered(request)
  const withUrns = all.courses.find((course: any) => urnsOf(course).length > 0)
  test.skip(!withUrns, 'seed data has no course with custom code urns')

  const urn = urnsOf(withUrns)[0]
  const included = await search(request, { urn })
  const excluded = await search(request, { excludeUrns: urn })

  expect(included.total + excluded.total).toBe(all.total)
})

test('excludeUrns with mode=and only drops courses carrying every listed urn', async ({ request }) => {
  const all = await unfiltered(request)
  const withTwo = all.courses.find((course: any) => new Set(urnsOf(course)).size > 1)
  test.skip(!withTwo, 'seed data has no course with two distinct urns')

  const [first, second] = [...new Set(urnsOf(withTwo))]
  const unrelated = `${first}-definitely-not-a-real-urn`

  const andBoth = await search(request, { excludeUrns: `${first},${second}`, excludeUrnsMode: 'and' })
  const andOneMissing = await search(request, { excludeUrns: `${first},${unrelated}`, excludeUrnsMode: 'and' })
  const orOneMissing = await search(request, { excludeUrns: `${first},${unrelated}`, excludeUrnsMode: 'or' })

  expect(andBoth.courses.some((course: any) => course.id === withTwo.id)).toBe(false)
  expect(andOneMissing.courses.some((course: any) => course.id === withTwo.id)).toBe(true)
  expect(orOneMissing.courses.some((course: any) => course.id === withTwo.id)).toBe(false)
})

test('an exclude filter beats an include filter naming the same urn', async ({ request }) => {
  const all = await unfiltered(request)
  const withUrns = all.courses.find((course: any) => urnsOf(course).length > 0)
  test.skip(!withUrns, 'seed data has no course with custom code urns')

  const urn = urnsOf(withUrns)[0]
  const both = await search(request, { urn, excludeUrns: urn })

  expect(both.total).toBe(0)
})

test('an empty exclude value filters nothing', async ({ request }) => {
  const all = await unfiltered(request)
  const emptyUrns = await search(request, { excludeUrns: '' })
  const emptyCodes = await search(request, { excludeCourseCodes: '' })
  const onlyCommas = await search(request, { excludeCourseCodes: ' , , ' })

  expect(emptyUrns.total).toBe(all.total)
  expect(emptyCodes.total).toBe(all.total)
  expect(onlyCommas.total).toBe(all.total)
})

test('the courses page exclude-code field actually filters the listing', async ({ page, request }) => {
  const all = await unfiltered(request)
  const excluded = codesOf(all.courses[0])[0]

  await page.goto('/admin/courses')
  const total = page.getByText(/yhteensä/i).first()
  await expect(total).toBeVisible()

  await page.getByLabel('Poissulje (pilkulla eroteltuna)').fill(excluded)
  await page.getByRole('button', { name: 'Hae' }).click()

  await expect(page.getByRole('cell', { name: excluded, exact: false })).toHaveCount(0)
})

test('the courses page exclude-urn field actually filters the listing', async ({ page, request }) => {
  const all = await unfiltered(request)
  const withUrns = all.courses.find((course: any) => urnsOf(course).length > 0)
  test.skip(!withUrns, 'seed data has no course with custom code urns')

  const urn = urnsOf(withUrns)[0]
  const shortCode = urn.split(':').pop() as string

  await page.goto('/admin/courses')

  const urnCells = page.getByRole('cell').filter({ hasText: shortCode })
  await expect.poll(() => urnCells.count()).toBeGreaterThan(0)

  const field = page.locator('#course-urn-exclude')
  await field.fill(urn)
  await field.press('Enter')
  await page.getByRole('button', { name: 'Hae' }).click()

  await expect.poll(() => urnCells.count()).toBe(0)
  await expect(page.getByRole('cell').first()).toBeVisible()
})

test('the bulk preview applies the same exclude filters as the listing', async ({ request }) => {
  const all = await unfiltered(request)
  const excluded = codesOf(all.courses[0])[0]
  const filtered = await search(request, { excludeCourseCodes: excluded })

  const preview = await (
    await request.post('/api/admin/course-tags/bulk/preview', {
      data: { filters: { excludeCourseCodes: excluded }, tagKeys: ['kks-kor'], mode: 'add' },
    })
  ).json()

  expect(preview.matched).toBe(filtered.total)
})
