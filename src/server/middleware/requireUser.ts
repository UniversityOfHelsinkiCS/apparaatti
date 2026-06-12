import type { NextFunction, Request, Response } from 'express'

const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  next()
}

export default requireUser
