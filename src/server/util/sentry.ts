import * as Sentry from '@sentry/node'

import { inProduction, inStaging, RELEASE_VERSION } from './config.ts'

const SENTRY_DSN = 'https://ffcc1f09bdc93186302e1ab550ae130c@toska.it.helsinki.fi/15'

if (inProduction && !inStaging) {
  Sentry.init({
    dsn: SENTRY_DSN,
    sendDefaultPii: false,
    environment: 'production',
    release: RELEASE_VERSION,
  })
}
