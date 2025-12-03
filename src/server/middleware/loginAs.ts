
import { User } from '../db/models'
import { isAdmin } from '../util/validations'

const loginAsMiddleware = async (
  req, next
) => {
  
  const loginAsId = req.headers["x-login-as"]
  if (typeof loginAsId === 'string' && isAdmin(req?.user)) {
  
    const loggedInAsUser = await User.findByPk(loginAsId)
  
    if (loggedInAsUser) {
      req.user = loggedInAsUser.toJSON()
      req.loginAs = true
    }
  }

  next()
}

export default loginAsMiddleware
