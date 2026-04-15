

import User from '../db/models/user.ts'
import { isSuperuser } from '../util/validations.ts'

const loginAsMiddleware = async (
  req, _, next
) => {
  const loginAsId = req.headers['x-login-as']
  if (typeof loginAsId === 'string' && isSuperuser(req?.user)) {
  
    const loggedInAsUser = await User.findByPk(loginAsId)
  
    if (loggedInAsUser) {
      req.user = loggedInAsUser.toJSON()
      req.loginAs = true
    }
  }

  next()
}

export default loginAsMiddleware
