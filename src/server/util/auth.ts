import passport from 'passport';
import OpenIDConnectStrategy from 'passport-openidconnect';
import { OIDC_AUTHORIZATION_URL, OIDC_ISSUER, OIDC_TOKEN_URL, OIDC_USERINFO_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI } from './config.ts';




async function setupAuth(){
  if (!OIDC_CLIENT_ID || !OIDC_CLIENT_SECRET || !OIDC_REDIRECT_URI) {
    console.log("skipping OIDC setup, missing env vars");
    return;

  }

  

  console.log("OIDC setup done");
  
}




export default setupAuth