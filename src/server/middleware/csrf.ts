import { doubleCsrf } from 'csrf-csrf'
import type { NextFunction, Request, Response } from 'express'

import { IN_E2E, inDevelopment, inProduction, SESSION_SECRET } from '../util/config.ts'

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => SESSION_SECRET,
  getSessionIdentifier: req => req.sessionID,
  cookieName: inProduction ? '__Host-apparaatti.x-csrf-token' : 'apparaatti.x-csrf-token',
  cookieOptions: {
    sameSite: 'lax',
    secure: !!inProduction,
    httpOnly: true,
    path: '/',
  },
})

// Triggered internally by scripts/runUpdater.sh, which has no browser session/cookie to carry a CSRF token.
const UNAUTHENTICATED_PATHS = new Set(['/updater/run'])

const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // mirrors the mock-auth/CORS relaxation already used for these modes elsewhere in the app
  if (inDevelopment || IN_E2E || UNAUTHENTICATED_PATHS.has(req.path)) {
    next()
    return
  }
  doubleCsrfProtection(req, res, next)
}

export { csrfProtection, generateCsrfToken }
