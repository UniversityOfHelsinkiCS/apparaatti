import path from 'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDatabase } from './db/connection.ts'
import express from 'express'
import session from 'express-session'
import passport from 'passport'

import router from './routes/router.ts'

import { seed } from './test/seed.ts'
import { REDIS_URL, SESSION_SECRET, OIDC_AUTHORIZATION_URL, OIDC_ISSUER, OIDC_TOKEN_URL, OIDC_USERINFO_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI } from './util/config.ts'
import {createClient} from 'redis'
import {RedisStore} from 'connect-redis'
import OpenIDConnectStrategy from 'passport-openidconnect';


const redisClient = createClient({ 
  url: REDIS_URL,
});
redisClient.on('ready', () => {console.log("connected to redis")}).connect().catch(console.error);



passport.use(new OpenIDConnectStrategy({
  issuer: OIDC_ISSUER,
  authorizationURL: OIDC_AUTHORIZATION_URL,
  tokenURL: OIDC_TOKEN_URL,
  userInfoURL: OIDC_USERINFO_URL,
  clientID: OIDC_CLIENT_ID,
  clientSecret: OIDC_CLIENT_SECRET,
  callbackURL: OIDC_REDIRECT_URI,
}, function verify(issuer, profile, cb) {
  console.log('OpenID Connect profile:', profile);
  return cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  console.log("serializing user", user);
  process.nextTick(function() {
    cb(null, user);
  });
});

passport.deserializeUser(function(user, cb) {
  console.log("deserializing user", user);
  process.nextTick(function() {
    return cb(null, user);
  });
});

const app = express()

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({client: redisClient}),
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
  console.log(`Server running on port ${process.env.PORT}`)
})
