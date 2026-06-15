import type { User } from '../../common/types.ts'

type WithGroups = { hyGroupCn?: string[] | null }

export const isSuperuser = (user: WithGroups) => {
  const groups = user?.hyGroupCn
  if (!groups) {
    return false
  }
  return groups.includes('grp-toska')
}

export const isAdmin = (user: WithGroups) => {
  const groups = user?.hyGroupCn
  if (!groups) {
    return false
  }
  return (
    groups?.includes('hy-kielikeskus-employees') ||
    groups?.includes('grp-toska') ||
    groups?.includes('grp-a90600-opintot')
  )
}

export const enforceIsUser = (req: any): User => {
  if (!req?.user) {
    throw new Error('Unauthorized')
  }
  return req.user as User
}

export const enforceIsAdmin = (user: User) => {
  const isadmin = isAdmin(user)
  if (!isadmin) {
    throw new Error('Unauthorized')
    return
  }

  return true
}

export const enforceIsSuperuser = (user: User) => {
  const superuser = isSuperuser(user)
  if (!superuser) {
    throw new Error('Unauthorized')
    return
  }

  return true
}
