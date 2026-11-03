import { describe, expect, it } from 'vitest'

import { customCodeUrnTagKeys, TAG_URN_KEY, tagsToCustomCodeUrns } from '../../common/courseTags.ts'

const urn = (key: string) => `urn:code:custom:hy-university-root-id:kk-apparaatti:${key}`

describe('customCodeUrnTagKeys', () => {
  it('takes the key from every kk-apparaatti urn and dedupes across map keys', () => {
    const keys = customCodeUrnTagKeys({
      'urn:code:custom:hy-university-root-id:kk-apparaatti': [urn('kks-kor'), urn('kkt-hum')],
      'urn:code:custom:hy-university-root-id:other': [urn('kks-kor')],
    })

    expect(keys).toEqual(['kks-kor', 'kkt-hum'])
  })

  it('skips urns outside the kk-apparaatti prefix and deeper sub urns', () => {
    const keys = customCodeUrnTagKeys({
      sisu: ['urn:code:custom:hy-university-root-id:something-else:kks-kor', urn('kks-kor:sub'), urn('')],
    })

    expect(keys).toEqual([])
  })

  it('does not read back the tags we wrote into the served map ourselves', () => {
    const served = tagsToCustomCodeUrns(null, ['kks-val'])

    expect(served[TAG_URN_KEY]).toEqual(['kks-val'])
    expect(customCodeUrnTagKeys(served)).toEqual([])
  })
})
