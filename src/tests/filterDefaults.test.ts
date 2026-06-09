import { describe, expect, it } from 'vitest'
import { toQuestion } from '../client/util/filterConfigAdapter'
import { getDefaultSelectedOptionIds } from '../client/util/filterDefaults'
import type { FilterConfig } from '../common/types'

describe('multichoice filter defaults', () => {
  it('preserves option selectedByDefault when adapting filter config for the frontend', () => {
    const filterConfig: FilterConfig = {
      id: 'study-place',
      mandatory: false,
      shortName: { fi: 'Opetusmuoto', sv: 'Undervisningsform', en: 'Teaching method' },
      displayOrder: 1,
      displayType: 'multichoice',
      superToggle: false,
      hideInCurrentFiltersDisplay: false,
      hideInRecommendationReasons: false,
      hideInFilterSidebar: false,
      showInWelcomeModal: false,
      coordinateKey: 'studyPlace',
      isStrictByDefault: true,
      enabled: true,
      variants: [
        {
          name: 'default',
          question: { fi: 'Q', sv: 'Q', en: 'Q' },
          options: [
            {
              id: 'online',
              name: { fi: 'Etäopetus', sv: 'Distans', en: 'Online' },
              selectedByDefault: true,
            },
            {
              id: 'exam',
              name: { fi: 'Tentti', sv: 'Tentamen', en: 'Exam' },
              selectedByDefault: false,
            },
          ],
        },
      ],
    }

    const question = toQuestion(filterConfig, 'fi')

    expect(question.variants[0].options?.map(option => option.selectedByDefault)).toEqual([true, false])
  })

  it('returns the option ids marked selected by default', () => {
    const question = toQuestion(
      {
        id: 'study-period',
        mandatory: false,
        shortName: { fi: 'Periodi', sv: 'Period', en: 'Period' },
        displayOrder: 1,
        displayType: 'multichoice',
        superToggle: false,
        hideInCurrentFiltersDisplay: false,
        hideInRecommendationReasons: false,
        hideInFilterSidebar: false,
        showInWelcomeModal: false,
        coordinateKey: 'date',
        isStrictByDefault: false,
        enabled: true,
        variants: [
          {
            name: 'default',
            question: { fi: 'Q', sv: 'Q', en: 'Q' },
            options: [
              {
                id: 'period_1',
                name: { fi: '1. periodi', sv: '1. period', en: '1. period' },
                selectedByDefault: true,
              },
              {
                id: 'period_2',
                name: { fi: '2. periodi', sv: '2. period', en: '2. period' },
                selectedByDefault: false,
              },
              {
                id: 'period_3',
                name: { fi: '3. periodi', sv: '3. period', en: '3. period' },
              },
            ],
          },
        ],
      },
      'fi'
    )

    expect(getDefaultSelectedOptionIds(question, 'default')).toEqual(['period_1'])
  })
})
