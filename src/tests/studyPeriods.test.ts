import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  closestPeriod,
  getCoursePeriod,
  dateIsInPeriod,
  dateObjToPeriod,
  dateToPeriod,
  getStudyPeriod,
  getStudyYear,
  parseDate,
} from '../server/util/studyPeriods.ts'

describe('studyPeriods', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('parseDate parses dd.mm.yyyy correctly', () => {
    const date = parseDate('02.01.2026')

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(0)
    expect(date.getDate()).toBe(2)
  })

  it('dateIsInPeriod includes start and end boundaries', () => {
    const period = {
      start_date: '2.9.2024',
      end_date: '20.10.2024',
    }

    expect(dateIsInPeriod(parseDate('1.9.2024'), period)).toBe(false)
    expect(dateIsInPeriod(parseDate('2.9.2024'), period)).toBe(true)
    expect(dateIsInPeriod(parseDate('20.10.2024'), period)).toBe(true)
    expect(dateIsInPeriod(parseDate('21.10.2024'), period)).toBe(false)
  })

  it('dateObjToPeriod returns overlapping periods when applicable', () => {
    const hits = dateObjToPeriod(parseDate('6.5.2025'))
    const names = hits.map((period) => period.name)

    expect(names).toContain('exam_week_4')
    expect(names).toContain('intensive_3')
  })

  it('dateToPeriod returns empty array when date does not belong to any configured period', () => {
    const hits = dateToPeriod('1.1.2024')

    expect(hits).toEqual([])
  })

  it('getCoursePeriod returns overlapping periods for a course range', () => {
    const periods = getCoursePeriod({
      startDate: parseDate('6.5.2025'),
      endDate: parseDate('6.5.2025'),
    })

    const names = periods?.map((period) => period.name) ?? []
    expect(names).toContain('exam_week_4')
    expect(names).toContain('intensive_3')
  })

  it('getCoursePeriod returns null when course dates are outside configured calendar', () => {
    const periods = getCoursePeriod({
      startDate: parseDate('1.1.2033'),
      endDate: parseDate('2.1.2033'),
    })

    expect(periods).toBeNull()
  })

  it('getCoursePeriod includes boundary overlaps at period start and end', () => {
    const startBoundary = getCoursePeriod({
      startDate: parseDate('2.9.2024'),
      endDate: parseDate('2.9.2024'),
    })
    const endBoundary = getCoursePeriod({
      startDate: parseDate('20.10.2024'),
      endDate: parseDate('20.10.2024'),
    })

    expect(startBoundary?.some((period) => period.name === 'period_1')).toBe(true)
    expect(endBoundary?.some((period) => period.name === 'period_1')).toBe(true)
  })

  it('getCoursePeriod returns multiple periods for long course spans', () => {
    const periods = getCoursePeriod({
      startDate: parseDate('1.9.2025'),
      endDate: parseDate('20.12.2025'),
    })

    const names = periods?.map((period) => period.name) ?? []
    expect(names).toEqual(expect.arrayContaining(['period_1', 'exam_week_1', 'period_2', 'exam_week_2']))
  })

  it('getCoursePeriod returns null for invalid course range where end is before start', () => {
    const periods = getCoursePeriod({
      startDate: parseDate('10.1.2026'),
      endDate: parseDate('1.1.2026'),
    })

    expect(periods).toBeNull()
  })

  it('getCoursePeriod handles Date objects with time-of-day components', () => {
    const periods = getCoursePeriod({
      startDate: new Date(2025, 8, 1, 23, 59, 59),
      endDate: new Date(2025, 8, 1, 23, 59, 59),
    })

    expect(periods?.some((period) => period.name === 'period_1')).toBe(true)
  })

  it('getStudyPeriod finds known periods and maps intensive_3_previous alias', () => {
    const regularPeriod = getStudyPeriod('2025', 'period_1')
    const correctedPeriod = getStudyPeriod('2025', 'intensive_3_previous')
    const missingPeriod = getStudyPeriod('2025', 'not_a_period')

    expect(regularPeriod?.name).toBe('period_1')
    expect(correctedPeriod?.name).toBe('intensive_3')
    expect(missingPeriod).toBeNull()
  })

  it('closestPeriod returns nearest future period and supports name filtering', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 1))

    const closest = closestPeriod()
    const closestPeriodOne = closestPeriod('period_1')

    expect(closest?.period.name).toBe('intensive_1')
    expect(closest?.period.start_year).toBe('2024')
    expect(closestPeriodOne?.period.name).toBe('period_1')
    expect(closestPeriodOne?.period.start_year).toBe('2024')
  })

  it('closestPeriod returns undefined when no future period exists for requested name', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2033, 0, 1))

    const closest = closestPeriod('period_1')

    expect(closest).toBeUndefined()
  })

  it('getStudyYear returns start_year for known range and null outside configured years', () => {
    expect(getStudyYear(parseDate('2.9.2025'))).toBe('2025')
    expect(getStudyYear(parseDate('1.1.2033'))).toBeNull()
  })
})
