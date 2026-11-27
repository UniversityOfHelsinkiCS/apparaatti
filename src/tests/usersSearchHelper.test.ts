import { Op } from 'sequelize'
import { describe, expect, it } from 'vitest'

import {
  getWhereClauseForManyWordSearch,
  getWhereClauseForOneWordSearch,
  getWhereClauseForTwoWordSearch,
} from '../server/util/usersSearchHelper.ts'

const branches = (where: object): any[] => (where as any)[Op.or]

const fieldOf = (branch: any) => Object.keys(branch)[0]

const iLikeOf = (branch: any, field: string) => branch[field]?.[Op.iLike]

describe('getWhereClauseForOneWordSearch', () => {
  it('matches the word as a prefix of every identifying column the user model has', () => {
    const found = branches(getWhereClauseForOneWordSearch('virta'))

    expect(found.map(fieldOf)).toEqual(['username', 'firstNames', 'lastName', 'email', 'studentNumber'])
    expect(found.map(branch => iLikeOf(branch, fieldOf(branch)))).toEqual([
      'virta%',
      'virta%',
      'virta%',
      'virta%',
      'virta%',
    ])
  })
})

describe('getWhereClauseForTwoWordSearch', () => {
  it('reads the words as first name then last name', () => {
    const [firstThenLast] = branches(getWhereClauseForTwoWordSearch('matti virtanen'))

    expect(iLikeOf(firstThenLast, 'firstNames')).toBe('%matti%')
    expect(iLikeOf(firstThenLast, 'lastName')).toBe('virtanen%')
  })

  it('also reads both words as first names, so middle names can be searched', () => {
    const [, bothAsFirstNames] = branches(getWhereClauseForTwoWordSearch('matti virtanen'))

    expect(iLikeOf(bothAsFirstNames, 'firstNames')).toBe('%matti virtanen%')
    expect(bothAsFirstNames.lastName).toBeUndefined()
  })

  it('also reads the words the other way round, for a last name typed first', () => {
    const [, , lastThenFirst] = branches(getWhereClauseForTwoWordSearch('matti virtanen'))

    expect(iLikeOf(lastThenFirst, 'firstNames')).toBe('virtanen%')
    expect(iLikeOf(lastThenFirst, 'lastName')).toBe('matti%')
  })
})

describe('getWhereClauseForManyWordSearch', () => {
  it('searches the whole typed string as first names rather than folding the words together', () => {
    const [everyWordAsFirstNames] = branches(getWhereClauseForManyWordSearch('matti kalle virtanen'))

    expect(iLikeOf(everyWordAsFirstNames, 'firstNames')).toBe('matti kalle virtanen%')
  })

  it('splits the name at the front, treating the first word as the last name', () => {
    const [, lastNameFirst] = branches(getWhereClauseForManyWordSearch('matti kalle virtanen'))

    expect(iLikeOf(lastNameFirst, 'firstNames')).toBe('kalle virtanen%')
    expect(iLikeOf(lastNameFirst, 'lastName')).toBe('matti%')
  })

  it('splits the name at the back, treating the last word as the last name', () => {
    const [, , lastNameLast] = branches(getWhereClauseForManyWordSearch('matti kalle virtanen'))

    expect(iLikeOf(lastNameLast, 'firstNames')).toBe('matti kalle%')
    expect(iLikeOf(lastNameLast, 'lastName')).toBe('virtanen%')
  })
})
