import { describe, expect, it } from 'vitest'
import { formatLocalizedCourseName, getDisplayCourseName } from '../common/nameFormatter.ts'

describe('nameFormatter', () => {
  it('drops a leading study method segment by default', () => {
    const formatted = formatLocalizedCourseName({
      id: 'course-123',
      name: {
        fi: 'Verkko-opetus | AY: Academic and Professional Communication in English 1 & 2 (CEFR B2), Group 7',
        en: 'Online teaching | AY: Academic and Professional Communication in English 1 & 2 (CEFR B2), Group 7',
        sv: 'Nätundervisning | AY: Academic and Professional Communication in English 1 & 2 (CEFR B2), Group 7',
      },
      nameSpecifier: null,
    })

    expect(formatted).toBe(
      'FI: AY: Academic and Professional Communication in English 1 & 2 (CEFR B2), Group 7 | EN: Online teaching | AY: Academic and Professional Communication in English 1 & 2 (CEFR B2), Group 7 | SV: Nätundervisning | AY: Academic and Professional Communication in English 1 & 2 (CEFR B2), Group 7'
    )
  })

  it('keeps study method phrases when dropStudyMethod is false', () => {
    const formatted = formatLocalizedCourseName({
      id: 'course-123',
      name: {
        fi: 'Ruotsin perusteet',
        en: 'Basics of Swedish',
        sv: 'Grunderna i svenska',
      },
      nameSpecifier: {
        fi: 'Monimuoto-opetus',
        en: 'Blended teaching',
        sv: 'Flervägsundervisning',
      },
      dropStudyMethod: false,
    })

    expect(formatted).toBe(
      'FI: Ruotsin perusteet | Monimuoto-opetus | EN: Basics of Swedish | Blended teaching | SV: Grunderna i svenska | Flervägsundervisning'
    )
  })

  it('drops study method phrases embedded at the end of course names', () => {
    const formatted = formatLocalizedCourseName({
      id: 'course-456',
      name: {
        fi: 'Academic and Professional Communication in English 1 & 2 (CEFR B2), periodi III-IV, r15 (ALMS = Autonomous Learning ModuleS), Monimuoto-opetus',
        en: 'Academic and Professional Communication in English 1 & 2 (CEFR B2), periods III-IV, r15 (ALMS = Autonomous Learning ModuleS), Blended teaching',
        sv: 'Academic and Professional Communication in English 1 & 2 (CEFR B2), period III-IV, r15 (ALMS = Autonomous Learning ModuleS), Flervägsundervisning',
      },
      nameSpecifier: null,
    })

    expect(formatted).toBe(
      'FI: Academic and Professional Communication in English 1 & 2 (CEFR B2), periodi III-IV, r15 (ALMS = Autonomous Learning ModuleS) | EN: Academic and Professional Communication in English 1 & 2 (CEFR B2), periods III-IV, r15 (ALMS = Autonomous Learning ModuleS), Blended teaching | SV: Academic and Professional Communication in English 1 & 2 (CEFR B2), period III-IV, r15 (ALMS = Autonomous Learning ModuleS), Flervägsundervisning'
    )
  })

  it('drops repeated study method phrases from both prefix and suffix positions', () => {
    const formatted = formatLocalizedCourseName({
      id: 'course-789',
      name: {
        fi: 'Verkko-opetus | Academic and Professional Communication in English 1 & 2 (CEFR B2), r18a, intensiiviperiodi, Verkko-opetus',
        en: 'Online teaching | Academic and Professional Communication in English 1 & 2 (CEFR B2), r18a, intensive period, Online teaching',
        sv: 'Nätundervisning | Academic and Professional Communication in English 1 & 2 (CEFR B2), r18a, intensivperiod, Nätundervisning',
      },
      nameSpecifier: null,
    })

    expect(formatted).toBe(
      'FI: Academic and Professional Communication in English 1 & 2 (CEFR B2), r18a, intensiiviperiodi | EN: Online teaching | Academic and Professional Communication in English 1 & 2 (CEFR B2), r18a, intensive period, Online teaching | SV: Nätundervisning | Academic and Professional Communication in English 1 & 2 (CEFR B2), r18a, intensivperiod, Nätundervisning'
    )
  })

  it('drops study method phrases from the single-language display name used in recommendations', () => {
    const monimuotoName = getDisplayCourseName(
      {
        id: 'course-901',
        name: {
          fi: 'Toisen kotimaisen kielen suullinen ja kirjallinen taito, ruotsi (CEFR B1), periodi III, r4, Monimuoto-opetus',
        },
        nameSpecifier: null,
      },
      'fi'
    )

    const etaopetusName = getDisplayCourseName(
      {
        id: 'course-902',
        name: {
          fi: 'Toisen kotimaisen kielen suullinen ja kirjallinen taito, ruotsi (CEFR B1), intensiivijakso, r9, Keskustakampus, Etäopetus',
        },
        nameSpecifier: null,
      },
      'fi'
    )

    expect(monimuotoName).toBe(
      'Toisen kotimaisen kielen suullinen ja kirjallinen taito, ruotsi (CEFR B1), periodi III, r4'
    )
    expect(etaopetusName).toBe(
      'Toisen kotimaisen kielen suullinen ja kirjallinen taito, ruotsi (CEFR B1), intensiivijakso, r9, Keskustakampus'
    )
  })
})
