import * as openidClient from 'openid-client'
import passport from 'passport'


import User from '../models/user.ts'
import { OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI, OIDC_AUTHORIZATION_URL, OIDC_TOKEN_URL, OIDC_USERINFO_URL } from './config.ts'
import { response } from 'express'


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
  scope: 'openid profile email',
  claims: {
    id_token: {
      uid: { essential: true },
      hyPersonSisuId: { essential: true },
      given_name: { essential: true },
      family_name: { essential: true },
      schacDateOfBirth: { essential: true },
      email: { essential: true },
      hyGroupCn: { essential: true },
    },
    userinfo: {
      uid: { essential: true },
      hyPersonSisuId: { essential: true },
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
  console.log('Issuer:', issuer)
  console.log('Client:', client)
  return client
}

const verifyLogin = async (_tokenSet: openidClient.TokenSet, userinfo, done: (err: any, user?: unknown) => void) => {
  console.log('User info:', userinfo)
  console.log('Token set:', _tokenSet)
 
  
  const user: User = {
    id: userinfo.sub as string,
    username: userinfo.uid as string,
    language: 'fi',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User

  const [_, created] = await User.upsert({
    ...user,
  })

  done(null, { ...user, newUser: user })
}

const setupAuthentication = async () => {
 
  const client = await getClient()

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user)
  
    return done(null, user)
  })

  passport.deserializeUser((obj, done) => {
    return done(null, obj)
  })

  
  passport.use('oidc', new openidClient.Strategy({ client, params }, verifyLogin))
}

export default setupAuthentication