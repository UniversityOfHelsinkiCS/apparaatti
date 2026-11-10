import { describe, expect, it } from 'vitest'

import {
  canCloseWelcomeModal,
  shouldAutoOpenWelcomeModal,
  shouldFetchRecommendations,
} from '../client/util/editModeAnswers'

const autoOpen = (overrides: Partial<Parameters<typeof shouldAutoOpenWelcomeModal>[0]>) =>
  shouldAutoOpenWelcomeModal({
    isEditMode: false,
    hasUnansweredMandatory: false,
    hasVisited: true,
    hasEducationLanguage: true,
    ...overrides,
  })

describe('shouldAutoOpenWelcomeModal', () => {
  it('opens for unanswered mandatory questions outside edit mode', () => {
    expect(autoOpen({ hasUnansweredMandatory: true })).toBe(true)
  })

  it('does not open for unanswered mandatory questions in edit mode', () => {
    expect(autoOpen({ isEditMode: true, hasUnansweredMandatory: true })).toBe(false)
  })

  it('opens on the first visit without an education language', () => {
    expect(autoOpen({ hasVisited: false, hasEducationLanguage: false })).toBe(true)
  })

  it('does not open on the first visit in edit mode', () => {
    expect(autoOpen({ isEditMode: true, hasVisited: false, hasEducationLanguage: false })).toBe(false)
  })

  it('does not open on the first visit when the education language is known', () => {
    expect(autoOpen({ hasVisited: false })).toBe(false)
  })

  it('does not open when visited and everything is answered', () => {
    expect(autoOpen({})).toBe(false)
  })
})

describe('canCloseWelcomeModal', () => {
  it.each([
    [false, false, false],
    [false, true, true],
    [true, false, true],
    [true, true, true],
  ])('isEditMode=%s mandatoryQuestionsAnswered=%s -> %s', (isEditMode, mandatoryQuestionsAnswered, expected) => {
    expect(canCloseWelcomeModal({ isEditMode, mandatoryQuestionsAnswered })).toBe(expected)
  })
})

describe('shouldFetchRecommendations', () => {
  it('skips recommendations in edit mode when the faculty is "any"', () => {
    expect(shouldFetchRecommendations({ isEditMode: true, organisationCode: '' })).toBe(false)
  })

  it('fetches in edit mode when a faculty is chosen', () => {
    expect(shouldFetchRecommendations({ isEditMode: true, organisationCode: 'H3456' })).toBe(true)
  })

  it('keeps fetching outside edit mode even without a faculty', () => {
    expect(shouldFetchRecommendations({ isEditMode: false, organisationCode: '' })).toBe(true)
  })
})
