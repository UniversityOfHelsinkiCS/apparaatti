import { expect, test } from './fixtures'

const STUDENT_POST_ROUTES = ['/api/form/coursedata', '/api/feedback', '/api/user/settings']

const longText = (length: number) => 'x'.repeat(length)

const validAnswers = {
  'study-field-select': 'H50',
  lang: 'sv',
  'primary-language': 'fi',
  'primary-language-specification': 'written',
}

test.describe('a POST with no body is refused rather than crashed on', () => {
  for (const path of STUDENT_POST_ROUTES) {
    test(path, async ({ userRequest }) => {
      expect((await userRequest.fetch(path, { method: 'POST' })).status()).toBe(400)
    })
  }
})

test.describe('a POST with an array body is refused', () => {
  for (const path of STUDENT_POST_ROUTES) {
    test(path, async ({ userRequest }) => {
      expect((await userRequest.fetch(path, { method: 'POST', data: [] })).status()).toBe(400)
    })
  }
})

test.describe('course data answers', () => {
  test('refuses a submission with no answers at all', async ({ userRequest }) => {
    const response = await userRequest.post('/api/form/coursedata', { data: {} })

    expect(response.status()).toBe(400)
  })

  test('refuses a numeric answer value', async ({ userRequest }) => {
    const response = await userRequest.post('/api/form/coursedata', { data: { answerData: { lang: 1 } } })

    expect(response.status()).toBe(400)
  })

  test('refuses an empty answer value', async ({ userRequest }) => {
    const response = await userRequest.post('/api/form/coursedata', { data: { answerData: { lang: '' } } })

    expect(response.status()).toBe(400)
  })

  test('refuses a nested object as an answer value', async ({ userRequest }) => {
    const response = await userRequest.post('/api/form/coursedata', {
      data: { answerData: { lang: { fi: 'fi' } } },
    })

    expect(response.status()).toBe(400)
  })

  test('answers an unknown organisation with an empty recommendation list', async ({ userRequest }) => {
    const response = await userRequest.post('/api/form/coursedata', {
      data: { answerData: { ...validAnswers, 'study-field-select': 'not-an-organisation' } },
    })

    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual([])
  })

  test('answers an unknown language with an empty recommendation list', async ({ userRequest }) => {
    const response = await userRequest.post('/api/form/coursedata', {
      data: { answerData: { ...validAnswers, lang: 'de' } },
    })

    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual([])
  })
})

test.describe('feedback', () => {
  test('refuses text that is only whitespace', async ({ userRequest }) => {
    const response = await userRequest.post('/api/feedback', { data: { textFeedback: '   ', stars: 3 } })

    expect(response.status()).toBe(400)
  })

  test('refuses a star count above the scale', async ({ userRequest }) => {
    const response = await userRequest.post('/api/feedback', { data: { textFeedback: 'x', stars: 99 } })

    expect(response.status()).toBe(400)
  })

  test('refuses a star count that is not a number', async ({ userRequest }) => {
    const response = await userRequest.post('/api/feedback', { data: { textFeedback: 'x', stars: 'five' } })

    expect(response.status()).toBe(400)
  })

  test('refuses an app version longer than its column', async ({ userRequest }) => {
    const response = await userRequest.post('/api/feedback', {
      data: { textFeedback: 'x', stars: 3, appVersion: longText(256) },
    })

    expect(response.status()).toBe(400)
  })

  test('refuses text longer than the comment limit', async ({ userRequest }) => {
    const response = await userRequest.post('/api/feedback', {
      data: { textFeedback: longText(10001), stars: 3 },
    })

    expect(response.status()).toBe(400)
  })

  test('refuses more attached courses than the metadata limit', async ({ userRequest }) => {
    const courses = Array.from({ length: 2001 }, (_item, index) => ({ id: `cur-${index}` }))
    const response = await userRequest.post('/api/feedback', {
      data: { textFeedback: 'x', stars: 3, recommendationMetadata: { filterState: {}, courses } },
    })

    expect(response.status()).toBe(400)
  })

  test('refuses recommendation metadata of the wrong shape', async ({ userRequest }) => {
    const response = await userRequest.post('/api/feedback', {
      data: { textFeedback: 'x', stars: 3, recommendationMetadata: { filterState: {}, courses: 'all of them' } },
    })

    expect(response.status()).toBe(400)
  })
})

test.describe('user settings', () => {
  test('refuses an empty education language', async ({ userRequest }) => {
    const response = await userRequest.post('/api/user/settings', { data: { educationLanguage: '' } })

    expect(response.status()).toBe(400)
  })

  test('refuses an education language longer than its column', async ({ userRequest }) => {
    const response = await userRequest.post('/api/user/settings', { data: { educationLanguage: longText(256) } })

    expect(response.status()).toBe(400)
  })

  test('refuses an education language that is not a string', async ({ userRequest }) => {
    const response = await userRequest.post('/api/user/settings', { data: { educationLanguage: ['fi'] } })

    expect(response.status()).toBe(400)
  })
})

test.describe('backend locale query parameters', () => {
  test('refuses an unknown language', async ({ userRequest }) => {
    expect((await userRequest.get('/api/backend-locales?lang=de')).status()).toBe(400)
  })

  test('refuses a repeated language parameter', async ({ userRequest }) => {
    expect((await userRequest.get('/api/backend-locales?lang=fi&lang=sv')).status()).toBe(400)
  })

  test('refuses an unknown specification', async ({ userRequest }) => {
    expect((await userRequest.get('/api/backend-locales?primaryLanguageSpecification=sung')).status()).toBe(400)
  })

  test('treats an unknown organisation as a wildcard', async ({ userRequest }) => {
    expect((await userRequest.get('/api/backend-locales?organisation=not-an-organisation')).status()).toBe(200)
  })
})

test.describe('logging out', () => {
  test('redirects once and leaves the server answering', async ({ userRequest }) => {
    const response = await userRequest.get('/api/logout', { maxRedirects: 0 })

    expect(response.status()).toBe(302)
    expect((await userRequest.get('/api/version')).status()).toBe(200)
  })
})
