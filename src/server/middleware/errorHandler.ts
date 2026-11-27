import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import logger from '../util/logger.ts'

const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error)
    return
  }

  if (error instanceof ZodError) {
    res.status(400).json({ message: 'Invalid input', errors: error.flatten() })
    return
  }

  logger.error('Unhandled error', {
    method: req.method,
    path: req.path,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  })

  res.status(500).json({ message: 'Internal server error' })
}

export default errorHandler
