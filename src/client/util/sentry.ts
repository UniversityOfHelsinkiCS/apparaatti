import * as Sentry from '@sentry/react'

const SENTRY_DSN = 'https://6170f8b02feba1a38e45792533c6ba8f@toska.it.helsinki.fi/34'

const inProduction = window.location.hostname.startsWith('polku')

if (inProduction) {
  Sentry.init({
    dsn: SENTRY_DSN,
    sendDefaultPii: false,
    environment: 'production',
    release: __RELEASE_VERSION__ ?? undefined,
  })
}
