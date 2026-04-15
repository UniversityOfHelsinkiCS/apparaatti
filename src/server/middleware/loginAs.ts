
import { userWithId } from '../util/dbActions.ts'
import { isSuperuser } from '../util/validations.ts'

const loginAsMiddleware = async (
  req: any, _: any, next: any
) => {
  const loginAsId = req.headers['x-login-as']
  if (typeof loginAsId === 'string' && isSuperuser(req?.user)) {
  
    const loggedInAsUser = await userWithId(loginAsId)
  
    if (loggedInAsUser) {
      req.user = loggedInAsUser.toJSON()
      req.loginAs = true
    }
  }

  next()
}

export default loginAsMiddleware
