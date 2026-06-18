import type { NextFunction, Request, Response } from 'express'

import type { User } from '../../common/types'

const mockUser: User = {
  id: 'hy-hlo-135753688',
  username: 'hy-hlo-testuser',
  language: 'fi',
  isAdmin: true,
  hyGroupCn: ['grp-toska', 'hy-kielikeskus-employees'],
  studentNumber: null,
  email: 'grp-toska@helsinki.fi',
}

const mockUserMiddleware = (req: Request, _: Response, next: NextFunction) => {
  if (req.path.includes('/login')) return next()

  req.user = mockUser

  return next()
}

export default mockUserMiddleware
