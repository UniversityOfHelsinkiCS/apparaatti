import path from 'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDatabase } from './db/connection.ts'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import SQLiteStore from 'connect-sqlite3'

import router from './routes/router.ts'

import { seed } from './test/seed.ts'
import setupAuth from './util/auth.ts'
import { SESSION_SECRET } from './util/config.ts'


const app = express()

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' }) //this causes issues with multiple pods...
}));
app.use(passport.authenticate('session'));


app.use('/api', router)
app.use('/api/ping', (_req, res) => { res.send("pong") })
app.use('/api', (_, res) => {
  res.sendStatus(404)
})

if (process.env.NODE_ENV === "production") {
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
  await seed()
  await setupAuth()
  console.log(`Server running on port ${process.env.PORT}`)
})
