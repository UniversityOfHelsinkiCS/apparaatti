import type { User } from '../../common/types.ts'

export const isAdmin = (user: User) => {
     const groups = user?.hyGroupCn
     if(!groups){
       return false
     }
    return groups?.includes('hy-kielikeskus-employees') ||  groups?.includes('grp-toska') || groups?.includes('grp-a90600-opintot')
}
