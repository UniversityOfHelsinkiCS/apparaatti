import { defineConfig, devices } from '@playwright/test'

//github actions runners are slow and the playwright defaults (30s per test, 5s per expect)
//are not enough for the docker compose stack, so give everything more room on ci
const isCi = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  timeout: isCi ? 90_000 : 45_000,
  expect: {
    timeout: isCi ? 20_000 : 10_000,
  },
  use: {
    baseURL: 'http://localhost:3001',
    actionTimeout: isCi ? 20_000 : 10_000,
    navigationTimeout: isCi ? 45_000 : 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
