
export const DATABASE_URL = process.env.DATABASE_URL || ''
export const inProduction = process.env.IN_PRODUCTION || ''


export const SESSION_SECRET = process.env.SESSION_SECRET || '1234'

export const OIDC_ISSUER = 'https://login-test.it.helsinki.fi'

export const OIDC_AUTHORIZATION_URL ='https://login-test.it.helsinki.fi/idp/profile/oidc/authorize'

export const OIDC_TOKEN_URL = 'https://login-test.it.helsinki.fi/idp/profile/oidc/token'

export const OIDC_USERINFO_URL = 'https://login-test.it.helsinki.fi/idp/profile/oidc/userinfo'




export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || ''

export const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET || ''

export const OIDC_REDIRECT_URI = process.env.OIDC_REDIRECT_URI || ''


export const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379'
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || ''
