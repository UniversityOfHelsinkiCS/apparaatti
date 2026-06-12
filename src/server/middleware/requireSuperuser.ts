import type { NextFunction, Request, Response } from 'express'
import { isSuperuser } from '../util/validations.ts'

const requireSuperuser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  if (!isSuperuser(req.user)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  next()
}

export default requireSuperuser
