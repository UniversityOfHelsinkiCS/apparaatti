import type { NextFunction, Request, Response } from 'express'
import { isAdmin } from '../util/validations.ts'

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  if (!isAdmin(req.user)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  next()
}

export default requireAdmin
