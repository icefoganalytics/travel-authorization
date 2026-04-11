import { createAuth0 } from "@auth0/auth0-vue"

import { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN, ENVIRONMENT } from "@/config"

export default createAuth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  authorizationParams: {
    audience: AUTH0_AUDIENCE,
    redirect_uri: window.location.origin,
  },
  cacheLocation: ENVIRONMENT === "development" ? "localstorage" : "memory",
})
