
export const DATABASE_URL = process.env.DATABASE_URL || ''
export const inProduction = process.env.IN_PRODUCTION || ''


export const SESSION_SECRET = process.env.SESSION_SECRET || ''

export const OIDC_ISSUER = inProduction
  ? 'https://login.helsinki.fi/.well-known/openid-configuration'
  : 'https://login-test.it.helsinki.fi/.well-known/openid-configuration'

export const OIDC_AUTHORIZATION_URL = inProduction
  ? 'https://login.helsinki.fi/idp/profile/oidc/authorize'
  : 'https://login-test.it.helsinki.fi/idp/profile/oidc/authorize'

export const OIDC_TOKEN_URL = inProduction
  ? 'https://login.helsinki.fi/idp/profile/oidc/token'
  : 'https://login-test.it.helsinki.fi/idp/profile/oidc/token'

export const OIDC_USERINFO_URL = inProduction
  ? 'https://login.helsinki.fi/idp/profile/oidc/userinfo'
  : 'https://login-test.it.helsinki.fi/idp/profile/oidc/userinfo'




export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || ''

export const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET || ''

export const OIDC_REDIRECT_URI = process.env.OIDC_REDIRECT_URI || ''
