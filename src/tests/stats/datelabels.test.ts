import { describe, expect, it } from 'vitest'

import { getGroupLabels, startOfGroup } from '../../common/datelabels.ts'

const utc = (iso: string) => new Date(iso)

describe('getGroupLabels', () => {
  it('opens at the group the range starts in, not at the range start itself', () => {
    const labels = getGroupLabels(utc('2026-01-15T13:45:00Z'), utc('2026-03-02T00:00:00Z'), 'month')

    expect(labels).toEqual(['2026-01', '2026-02', '2026-03'])
  })

  it('fills every day across a year boundary so days without visits can be drawn as zero', () => {
    const labels = getGroupLabels(utc('2025-12-30T10:00:00Z'), utc('2026-01-02T00:00:00Z'), 'day')

    expect(labels).toEqual(['2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02'])
  })

  it('rolls the hour over into the next day and month', () => {
    const labels = getGroupLabels(utc('2026-01-31T22:30:00Z'), utc('2026-02-01T01:00:00Z'), 'hour')

    expect(labels).toEqual(['2026-01-31 22:00', '2026-01-31 23:00', '2026-02-01 00:00', '2026-02-01 01:00'])
  })

  it('keeps hour labels exactly one apart across a local DST change, because every label is UTC', () => {
    const labels = getGroupLabels(utc('2026-03-29T00:00:00Z'), utc('2026-03-29T03:00:00Z'), 'hour')

    expect(labels).toEqual(['2026-03-29 00:00', '2026-03-29 01:00', '2026-03-29 02:00', '2026-03-29 03:00'])
  })

  it('returns nothing when the range ends before the group the start falls in', () => {
    const labels = getGroupLabels(utc('2026-03-10T00:00:00Z'), utc('2026-03-09T00:00:00Z'), 'day')

    expect(labels).toEqual([])
  })

  it('does not mutate the start date it was given while walking the range', () => {
    const start = utc('2026-01-15T13:45:00Z')
    getGroupLabels(start, utc('2026-04-02T00:00:00Z'), 'month')

    expect(start.toISOString()).toBe('2026-01-15T13:45:00.000Z')
  })
})

describe('startOfGroup', () => {
  it('truncates a year down to the first instant of january', () => {
    const start = startOfGroup(utc('2026-07-09T18:20:33.500Z'), 'year')

    expect(start.toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })

  it('truncates a month down to the first instant of its first day', () => {
    const start = startOfGroup(utc('2026-07-09T18:20:33.500Z'), 'month')

    expect(start.toISOString()).toBe('2026-07-01T00:00:00.000Z')
  })

  it('keeps the hour but drops minutes, seconds and milliseconds', () => {
    const start = startOfGroup(utc('2026-07-09T18:20:33.500Z'), 'hour')

    expect(start.toISOString()).toBe('2026-07-09T18:00:00.000Z')
  })
})
