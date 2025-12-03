import { User } from '../../common/types'


export const loginAs = (user: User) => {
  localStorage.setItem('loginAsUser', JSON.stringify(user))
  window.location.reload()
}


