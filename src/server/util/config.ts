export const DATABASE_URL = process.env.DATABASE_URL || ''
export const inProduction = process.env.IN_PRODUCTION || false
export const inDevelopment = process.env.NODE_ENV === 'development'

export const SESSION_SECRET = process.env.SESSION_SECRET || '1234'

export const OIDC_ISSUER = inProduction
  ? 'https://login.helsinki.fi/.well-known/openid-configuration'
  : 'https://login-test.it.helsinki.fi/.well-known/openid-configuration'
export const OIDC_AUTHORIZATION_URL = inProduction
  ?  'https://login.helsinki.fi/idp/profile/oidc/authorize'  
  : 'https://login-test.it.helsinki.fi/idp/profile/oidc/authorize'

export const OIDC_TOKEN_URL = inProduction
  ?  'https://login.helsinki.fi/idp/profile/oidc/token' 
  :  'https://login-test.it.helsinki.fi/idp/profile/oidc/token'

export const OIDC_USERINFO_URL = inProduction
  ?  'https://login.helsinki.fi/idp/profile/oidc/userinfo' 
  : 'https://login-test.it.helsinki.fi/idp/profile/oidc/userinfo'

export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || '1234'

export const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET || ''

export const OIDC_REDIRECT_URI = process.env.OIDC_REDIRECT_URI || ''

export const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379'
export const REDIS_HOST = process.env.REDIS_HOST || 'redis'
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || ''

//used by updater
export const API_TOKEN = process.env.API_TOKEN || 'dontuse1234'
export const UPDATER_CRON_ENABLED = process.env.UPDATER_CRON_ENABLED || false
export const UPDATER_TOKEN = process.env.UPDATER_TOKEN || ''

export const JAMI_URL = inProduction
  ? 'https://api-toska.apps.ocp-prod-0.k8s.it.helsinki.fi/jami/'
  : 'https://api-toska.apps.ocp-test-0.k8s.it.helsinki.fi/jami'

export const PATE_URL = inProduction
  ? 'https://api-toska.apps.ocp-prod-0.k8s.it.helsinki.fi/pate/'
  : 'https://api-toska.apps.ocp-test-0.k8s.it.helsinki.fi/pate/'

export const IMPORTER_URL =
  process.env.IMPORTER_URL || 'localhost:3003/importer'

export const LOKI_HOST = process.env.LOKI_HOST || 'http://loki-svc.toska-lokki.svc.cluster.local:3100'
