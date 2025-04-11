import { Issuer, Strategy, TokenSet, UnknownObject, UserinfoResponse } from 'openid-client'
import passport from 'passport'

import { inDevelopment, inE2E } from '../../config'
import { OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI } from './config'
import { UserParams } from '../../shared/types'
import { OpenIDAttributes } from '../types'
import { parseShibDateOfBirth } from '../middleware/authentication'
import { User } from '../db/models'

const params = {
  claims: {
    id_token: {
      uid: { essential: true },
      hyPersonSisuId: { essential: true },
    },
    userinfo: {
      given_name: { essential: true },
      family_name: { essential: true },
      schacDateOfBirth: { essential: true },
      email: { essential: true },
      hyGroupCn: { essential: true },
    },
  },
}

const getClient = async () => {
  const issuer = await Issuer.discover(OIDC_ISSUER)

  const client = new issuer.Client({
    client_id: OIDC_CLIENT_ID,
    client_secret: OIDC_CLIENT_SECRET,
    redirect_uris: [OIDC_REDIRECT_URI],
    response_types: ['code'],
  })

  return client
}

const verifyLogin = async (_tokenSet: TokenSet, userinfo: UserinfoResponse<UnknownObject, UnknownObject>, done: (err: any, user?: unknown) => void) => {
  const { uid: username, hyPersonSisuId: id, given_name: firstName, family_name: lastName, schacDateOfBirth, email, hyGroupCn: iamGroups } = userinfo as unknown as OpenIDAttributes

  const user: UserParams = {
    id: id || username,
    firstName,
    lastName,
    birthDate: parseShibDateOfBirth(schacDateOfBirth),
    email,
    iamGroups,
  }

  const [_, created] = await User.upsert({
    ...user,
  })

  done(null, { ...user, newUser: created })
}

const setupAuthentication = async () => {
  if (inDevelopment || inE2E) return

  const client = await getClient()

  passport.serializeUser((user, done) => {
    const { id, iamGroups, birthDate, newUser } = user as UserParams

    return done(null, { id, iamGroups, birthDate, newUser })
  })

  passport.deserializeUser(async ({ id, birthDate, iamGroups }: { id: string; birthDate: string; iamGroups: string[] }, done) => {
    const user = await User.findByPk(id)

    if (!user) return done(new Error('User not found'))

    return done(null, { ...user.dataValues, birthDate, iamGroups })
  })

  passport.use('oidc', new Strategy({ client, params }, verifyLogin))
}

export default setupAuthentication