import { createHash } from 'node:crypto'

import type { APIRequestContext } from '@playwright/test'

import { expect, test } from './fixtures'

const hashOf = (id: string) => createHash('sha256').update(id).digest('hex')

const rangeAround = (now: number) => {
  const start = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const end = new Date(now + 24 * 60 * 60 * 1000).toISOString()
  return `start=${start}&end=${end}&groupBy=day`
}

const visitCountFor = async (request: APIRequestContext, id: string) => {
  const visits = await (await request.get('/api/debug/visits')).json()
  return visits.byVisitor[hashOf(id)]?.count ?? 0
}

test.describe.configure({ mode: 'serial' })

test('a student visit is recorded and reaches the admin stats', async ({ userRequest, request, e2eUserId }) => {
  expect((await userRequest.get('/api/user')).status()).toBe(200)

  expect(await visitCountFor(request, e2eUserId)).toBeGreaterThan(0)

  const stats = await (await request.get(`/api/admin/stats?${rangeAround(Date.now())}`)).json()
  expect(stats.total.visitors.length).toBeGreaterThan(0)
  expect(stats.groups.length).toBeGreaterThan(0)
})

test('returning within the same hour does not add another visit', async ({ userRequest, request, e2eUserId }) => {
  const before = await visitCountFor(request, e2eUserId)

  await userRequest.get('/api/user')
  await userRequest.get('/api/user')

  expect(await visitCountFor(request, e2eUserId)).toBe(before)
})

test('an admin visit is never recorded', async ({ adminRequest, request, e2eUserId }) => {
  const before = await visitCountFor(request, e2eUserId)

  await adminRequest.get('/api/user')

  expect(await visitCountFor(request, e2eUserId)).toBe(before)
})

test('a grouping the schema does not allow is refused without leaking the failure', async ({ request }) => {
  const response = await request.get(
    `/api/admin/stats?${rangeAround(Date.now()).replace('groupBy=day', 'groupBy=fortnight')}`
  )

  expect(response.status()).toBe(400)

  const body = await response.json()
  expect(body.message).toBe('Invalid input')
  expect(body.stack).toBeUndefined()
  expect(JSON.stringify(body)).not.toContain('node_modules')
})

test('a range that predates every visit reports no visitors', async ({ request }) => {
  const start = new Date('2020-01-01T00:00:00.000Z').toISOString()
  const end = new Date('2020-01-02T00:00:00.000Z').toISOString()

  const stats = await (await request.get(`/api/admin/stats?start=${start}&end=${end}&groupBy=day`)).json()

  expect(stats.total.visitors).toEqual([])
})
