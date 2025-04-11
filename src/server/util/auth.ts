import passport from 'passport';
import OpenIDConnectStrategy from 'passport-openidconnect';
import { OIDC_AUTHORIZATION_URL, OIDC_ISSUER, OIDC_TOKEN_URL, OIDC_USERINFO_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI } from './config.ts';




async function setupAuth(){
  if (!OIDC_CLIENT_ID || !OIDC_CLIENT_SECRET || !OIDC_REDIRECT_URI) {
    console.log("skipping OIDC setup, missing env vars");
    return;

  }

  passport.use(new OpenIDConnectStrategy({
    issuer: OIDC_ISSUER,
    authorizationURL: OIDC_AUTHORIZATION_URL,
    tokenURL: OIDC_TOKEN_URL,
    userInfoURL: OIDC_USERINFO_URL,
    clientID: OIDC_CLIENT_ID,
    clientSecret: OIDC_CLIENT_SECRET,
    callbackURL: OIDC_REDIRECT_URI,
    scope: [ 'openid' ]
  }, function verify(issuer, profile, cb) {
    console.log('OpenID Connect profile:', profile);
    return cb(null, profile);
  }));

  passport.serializeUser(function(user, cb) {
    console.log("serializing user", user);
    process.nextTick(function() {
      cb(null, { id: user.id, name: user.name});
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    console.log("deserializing user", user);
    process.nextTick(function() {
      return cb(null, user);
    });
  });

  console.log("OIDC setup done");
  
}




export default setupAuth