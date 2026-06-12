import type { NextFunction, Request, Response } from 'express'
import type { User } from '../../common/types.ts'
import { isSuperuser } from '../util/validations.ts'

const requireSuperuser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const user = req.user as User

  if (!isSuperuser(user)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  next()
}

export default requireSuperuser
