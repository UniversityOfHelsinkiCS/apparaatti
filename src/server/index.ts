import path from 'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDatabase } from './db/connection.ts'
import express from 'express'
import session from 'express-session'
import passport from 'passport'

import router from './routes/router.ts'

import { seed } from './test/seed.ts'
import { REDIS_URL, SESSION_SECRET, OIDC_AUTHORIZATION_URL, OIDC_ISSUER, OIDC_TOKEN_URL, OIDC_USERINFO_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI, UPDATER_CRON_ENABLED } from './util/config.ts'
import { createClient } from 'redis'
import { RedisStore } from 'connect-redis'
import setupAuthentication from './util/oidc.ts'
import { redis } from './util/redis.ts'
import setupCron from './updater/cron.ts'


redis.on('ready', () => {console.log('connected to redis')}).connect().catch(console.error)

const app = express()
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({client: redis}),
}))

app.use(passport.initialize())
app.use(passport.session())


app.use('/api', router)
app.use('/api/ping', (_req, res) => { res.send('pong') })
app.use('/api', (_, res) => {
  res.sendStatus(404)
})

if (process.env.NODE_ENV === 'production') {
  const DIST_PATH = path.resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../dist'
  )
  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')
  app.use(express.static(DIST_PATH))
  app.get('/*mint', (_, res) => res.sendFile(INDEX_PATH))
}

app.listen(process.env.PORT, async () => {
  await connectToDatabase()
  //await seed()

  if (UPDATER_CRON_ENABLED === false){
    await setupAuthentication()
  }

  if(UPDATER_CRON_ENABLED){
   // await setupCron()
    console.log('Cron jobs started')
  }

  console.log(`Server running on port ${process.env.PORT}`)
})
