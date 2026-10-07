import { describe, expect, it } from 'vitest'

import { hasApparaattiCodeUrn } from '../../client/util/filtering.ts'
import { tagsToCustomCodeUrns } from '../../common/courseTags.ts'
import type { CourseData } from '../../common/types.ts'
import { urnInCustomCodeUrns } from '../../server/util/organisationCourseRecommmendations.ts'

const courseWith = (customCodeUrns: Record<string, string[]>) => ({ customCodeUrns }) as CourseData

describe('tagsToCustomCodeUrns', () => {
  it('produces a key the real server side urn matcher recognises', () => {
    const urns = tagsToCustomCodeUrns(null, ['kks-kor'])

    expect(urnInCustomCodeUrns(urns, 'kks-kor')).toBe(true)
    expect(urnInCustomCodeUrns(urns, 'kks-pre')).toBe(false)
  })

  it('produces a key the real client side filter predicate recognises', () => {
    const urns = tagsToCustomCodeUrns(null, ['kks-val'])

    expect(hasApparaattiCodeUrn(courseWith(urns), 'kks-val')).toBe(true)
    expect(hasApparaattiCodeUrn(courseWith(urns), 'kks-muk')).toBe(false)
  })

  it('keeps the sisu sourced urns alongside the resolved tags', () => {
    const sisu = { 'urn:code:custom:hy-university-root-id:kk-apparaatti': ['kks-kor'] }
    const urns = tagsToCustomCodeUrns(sisu, ['kks-val'])

    expect(urnInCustomCodeUrns(urns, 'kks-kor')).toBe(true)
    expect(urnInCustomCodeUrns(urns, 'kks-val')).toBe(true)
  })
})
