import { describe, expect, it } from 'vitest'

import {
  mergedProfile,
  visitorGroups,
  type VisitorProfile,
  type VisitorProfiles,
} from '../../server/util/visitorProfiles.ts'

const profile = (overrides: Partial<VisitorProfile> = {}): VisitorProfile => ({
  organisationCode: null,
  phase1Code: null,
  phase2Code: null,
  ...overrides,
})

const profilesOf = (entries: [string, VisitorProfile][]): VisitorProfiles => new Map(entries)

describe('mergedProfile', () => {
  it('fills a field the visitor had no value for yet', () => {
    const merged = mergedProfile(profile({ organisationCode: 'H50' }), profile({ phase1Code: 'KH50' }))

    expect(merged).toEqual({ organisationCode: 'H50', phase1Code: 'KH50', phase2Code: null })
  })

  it('keeps the earlier value when both visits carry one', () => {
    const merged = mergedProfile(profile({ organisationCode: 'H50' }), profile({ organisationCode: 'H55' }))

    expect(merged.organisationCode).toBe('H50')
  })

  it('takes the whole visit when the visitor is seen for the first time', () => {
    const merged = mergedProfile(undefined, profile({ organisationCode: 'H55', phase1Code: 'KH55' }))

    expect(merged).toEqual({ organisationCode: 'H55', phase1Code: 'KH55', phase2Code: null })
  })
})

describe('visitorGroups', () => {
  it('counts one visitor once however many visits they made', () => {
    const groups = visitorGroups(profilesOf([['hash-a', profile({ organisationCode: 'H50' })]]))

    expect(groups).toEqual([{ organisationCode: 'H50', phase1Code: null, phase2Code: null, count: 1 }])
  })

  it('groups visitors that share every field and keeps them apart otherwise', () => {
    const groups = visitorGroups(
      profilesOf([
        ['hash-a', profile({ organisationCode: 'H50' })],
        ['hash-b', profile({ organisationCode: 'H50' })],
        ['hash-c', profile({ organisationCode: 'H55' })],
      ])
    )

    expect(groups.map(group => [group.organisationCode, group.count])).toEqual([
      ['H50', 2],
      ['H55', 1],
    ])
  })

  it('does not merge visitors whose organisation matches but whose programme does not', () => {
    const groups = visitorGroups(
      profilesOf([
        ['hash-a', profile({ organisationCode: 'H50', phase1Code: 'KH50' })],
        ['hash-b', profile({ organisationCode: 'H50', phase1Code: 'MH50' })],
      ])
    )

    expect(groups).toHaveLength(2)
  })

  it('separates a missing organisation from an empty-string one', () => {
    const groups = visitorGroups(
      profilesOf([
        ['hash-a', profile({ organisationCode: null, phase1Code: 'KH50' })],
        ['hash-b', profile({ organisationCode: 'KH50', phase1Code: null })],
      ])
    )

    expect(groups).toHaveLength(2)
  })

  it('orders the groups by descending count', () => {
    const groups = visitorGroups(
      profilesOf([
        ['hash-a', profile({ organisationCode: 'H50' })],
        ['hash-b', profile({ organisationCode: 'H55' })],
        ['hash-c', profile({ organisationCode: 'H55' })],
        ['hash-d', profile({ organisationCode: 'H55' })],
      ])
    )

    expect(groups.map(group => group.count)).toEqual([3, 1])
  })
})
