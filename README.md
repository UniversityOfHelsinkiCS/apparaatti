# apparaatti

kielikeskuksen apparaatti recommendation system :rocket:

## terminologia

courseUnitRealisation = cur
course unit = cu

## e2e tests

Playwright tests in `e2e/`, run against a dockerized app + Postgres + Redis.

Install or update the browser binaries:

```
npx playwright install chromium
```

Then:

```
npm run e2e
```

Spins up the stack, runs the tests, tears it down.

To iterate on a test with the UI instead:

```
npm run e2e:ui
```
