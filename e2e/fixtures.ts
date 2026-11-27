import { type APIRequestContext, expect, test as base } from '@playwright/test'

// The e2e stack has one shared database, and answering the welcome modal writes
// `educationLanguage` for the request's user. Each Playwright worker therefore
// identifies itself with `x-e2e-user`, which mock_user.ts turns into its own user row,
// so parallel spec files cannot reset or onboard each other's settings.
type WorkerFixtures = {
  e2eUserId: string
}

type TestFixtures = {
  adminRequest: APIRequestContext
  userRequest: APIRequestContext
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  e2eUserId: [
    // eslint-disable-next-line no-empty-pattern -- playwright requires a destructuring pattern here
    async ({}, use, workerInfo) => {
      await use(`e2e-worker-${workerInfo.parallelIndex}`)
    },
    { scope: 'worker' },
  ],

  context: async ({ browser, e2eUserId }, use) => {
    const context = await browser.newContext({ extraHTTPHeaders: { 'x-e2e-user': e2eUserId } })
    await use(context)
    await context.close()
  },

  request: async ({ playwright, baseURL, e2eUserId }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { 'x-e2e-user': e2eUserId },
    })
    await use(requestContext)
    await requestContext.dispose()
  },

  adminRequest: async ({ playwright, baseURL, e2eUserId }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { 'x-e2e-user': e2eUserId, 'x-e2e-role': 'admin' },
    })
    await use(requestContext)
    await requestContext.dispose()
  },

  userRequest: async ({ playwright, baseURL, e2eUserId }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { 'x-e2e-user': e2eUserId, 'x-e2e-role': 'user' },
    })
    await use(requestContext)
    await requestContext.dispose()
  },
})

export { expect }
