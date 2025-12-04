import type { User } from '../../common/types.ts'

export const isAdmin = (user: User) => {
  const groups = user?.hyGroupCn
  if(!groups){
    return false
  }
  return groups?.includes('hy-kielikeskus-employees') ||  groups?.includes('grp-toska') || groups?.includes('grp-a90600-opintot')
}

export const enforceIsUser = (req) => {
  if (!req.user) {
    throw new Error('Unauthorized')
    return
  }
  return req.user
}

export const enforceIsAdmin = (user: User) => {
  const isadmin = isAdmin(user)
  if(!isadmin){
    throw new Error('Unauthorized')
    return
  }

  return true
}
