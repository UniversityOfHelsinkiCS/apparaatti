import { describe, expect, it, vi } from 'vitest'

vi.mock('../../server/util/organisationCourseRecommmendations.ts', () => ({
  courseHasCustomCodeUrn: vi.fn(),
  courseHasAnyOfCodes: vi.fn(),
  courseHasAnyRealisationCodeUrn: vi.fn(),
}))

vi.mock('../../server/util/dbActions.ts', () => ({
  organisationWithGroupIdOf: vi.fn(),
}))

import {
  commonCoordinateFromAnswerData,
  readAsStringArr,
  readArrOrSingleValue,
} from '../../server/util/recommender.ts'

describe('commonCoordinateFromAnswerData', () => {
  it('maps 1 to yesValue', () => {
    expect(commonCoordinateFromAnswerData('1', 10, 20, null)).toBe(10)
  })

  it('maps 0 to noValue', () => {
    expect(commonCoordinateFromAnswerData('0', 10, 20, null)).toBe(20)
  })

  it('maps neutral to neutralValue', () => {
    expect(commonCoordinateFromAnswerData('neutral', 10, 20, null)).toBe(null)
    expect(commonCoordinateFromAnswerData('neutral', 10, 20, 5)).toBe(5)
  })

  it('returns undefined for unexpected input', () => {
    expect(commonCoordinateFromAnswerData('unknown', 10, 20, null)).toBeUndefined()
  })
})

describe('readAsStringArr', () => {
  it('wraps single string in array', () => {
    expect(readAsStringArr('hello')).toEqual(['hello'])
  })

  it('leaves array unchanged', () => {
    expect(readAsStringArr(['a', 'b'])).toEqual(['a', 'b'])
  })
})

describe('readArrOrSingleValue', () => {
  it('wraps single string in array', () => {
    expect(readArrOrSingleValue('test')).toEqual(['test'])
  })

  it('leaves array unchanged', () => {
    expect(readArrOrSingleValue(['x', 'y'])).toEqual(['x', 'y'])
  })

  it('returns empty array for falsy input', () => {
    expect(readArrOrSingleValue('')).toEqual([])
    expect(readArrOrSingleValue(null as any)).toEqual([])
  })
})
