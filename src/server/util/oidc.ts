import * as openidClient from 'openid-client'
import passport from 'passport'

import User from '../models/user.ts'
import { OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI } from './config.ts'


type OpenIDAttributes = {
  uid: string
  hyPersonSisuId: string
  given_name: string
  family_name: string
  schacDateOfBirth: string
  email: string
  hyGroupCn: string[]
}


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
  const issuer = await openidClient.Issuer.discover(OIDC_ISSUER)

  const client = new issuer.Client({
    client_id: OIDC_CLIENT_ID,
    client_secret: OIDC_CLIENT_SECRET,
    redirect_uris: [OIDC_REDIRECT_URI],
    response_types: ['code'],
  })

  return client
}

const verifyLogin = async (_tokenSet: openidClient.TokenSet, userinfo: openidClient.UserinfoResponse<openidClient.UnknownObject, openidClient.UnknownObject>, done: (err: any, user?: unknown) => void) => {
  console.log('User info:', userinfo)
  
 
  const { uid: username, hyPersonSisuId: id, given_name: firstName, family_name: lastName, schacDateOfBirth, email, hyGroupCn: iamGroups } = userinfo as unknown as OpenIDAttributes

  const user: User = {
    id: id,
    username: username,
    language: 'fi',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User

  const [_, created] = await User.upsert({
    ...user,
  })

  done(null, { ...user, newUser: created })
}

const setupAuthentication = async () => {
 
  const client = await getClient()

  passport.serializeUser((user, done) => {
    const { id, username } = user as User

    return done(null, { id, username })
  })

  passport.deserializeUser(async ({ id, birthDate, iamGroups }: { id: string; birthDate: string; iamGroups: string[] }, done) => {
    const user = await User.findByPk(id)

    if (!user) return done(new Error('User not found'))

    return done(null, { ...user.dataValues, birthDate, iamGroups })
  })

  passport.use('oidc', new openidClient.Strategy({ client, params }, verifyLogin))
}

export default setupAuthentication