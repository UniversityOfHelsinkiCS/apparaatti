import path from 'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDatabase } from './db/connection.ts'
import express from 'express'
import session from 'express-session'
import passport from 'passport'

import router from './routes/router.ts'

import {
  SESSION_SECRET,
  UPDATER_CRON_ENABLED,
  inDevelopment,
} from './util/config.ts'
import { RedisStore } from 'connect-redis'
import setupAuthentication from './util/oidc.ts'
import { redis } from './util/redis.ts'
import setupCron from './updater/cron.ts'
import mockUserMiddleware from './middleware/mock_user.ts'

redis
  .on('ready', () => {
  })
  .connect()
  .catch(console.error)

const app = express()
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redis }),
  })
)

app.use(passport.initialize())
app.use(passport.session())
app.use(express.json({limit: '10mb'}))

// in develoment, fake the user
if (inDevelopment) {
  app.use(mockUserMiddleware)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
  })
}


app.use('/api', router)
app.use('/api/ping', (_req, res) => {
  res.send('pong')
})
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



  if (UPDATER_CRON_ENABLED === false) {
    await setupAuthentication()
  }

  if (UPDATER_CRON_ENABLED) {
    await setupCron()
  }

})
