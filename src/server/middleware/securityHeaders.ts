import type { NextFunction, Request, Response } from 'express'

import { inProduction } from '../util/config.ts'

const FRAME_ANCESTORS = ["'self'", 'https://helsinki.fi', 'https://*.helsinki.fi']

const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', `frame-ancestors ${FRAME_ANCESTORS.join(' ')}`)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')

  if (inProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  next()
}

export default securityHeaders
