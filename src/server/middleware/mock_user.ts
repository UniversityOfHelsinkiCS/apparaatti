import type { NextFunction, Request, Response } from 'express'

import type { User } from '../../common/types'
import UserModel from '../db/models/user.ts'
import { IN_E2E } from '../util/config.ts'

const mockUser: User = {
  id: 'hy-hlo-135753688',
  username: 'hy-hlo-testuser',
  language: 'fi',
  isAdmin: true,
  hyGroupCn: ['grp-toska', 'hy-kielikeskus-employees'],
  studentNumber: null,
  email: 'grp-toska@helsinki.fi',
}

const E2E_USER_ID_PATTERN = /^e2e-worker-\d+$/
const ensuredE2eUserIds = new Set<string>()

const e2eUserIdFromHeader = (req: Request) => {
  if (!IN_E2E) return null

  const header = req.get('x-e2e-user')
  if (!header || !E2E_USER_ID_PATTERN.test(header)) return null

  return header
}

const ensureE2eUserRow = async (id: string) => {
  if (ensuredE2eUserIds.has(id)) return

  await UserModel.upsert({
    id,
    username: id,
    firstNames: 'Testi',
    lastName: 'Kayttaja',
    language: mockUser.language ?? undefined,
    hyGroupCn: mockUser.hyGroupCn ?? undefined,
    studentNumber: '012345678',
  })
  ensuredE2eUserIds.add(id)
}

const mockUserMiddleware = async (req: Request, _: Response, next: NextFunction) => {
  if (req.path.includes('/login')) return next()

  const e2eUserId = e2eUserIdFromHeader(req)

  if (!e2eUserId) {
    req.user = mockUser
    return next()
  }

  await ensureE2eUserRow(e2eUserId)
  req.user = { ...mockUser, id: e2eUserId, username: e2eUserId }

  return next()
}

export default mockUserMiddleware
