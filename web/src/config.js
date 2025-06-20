export const APPLICATION_NAME = "Travel Authorization"
export const ENVIRONMENT = import.meta.env.MODE
export const RELEASE_TAG = import.meta.env.VUE_APP_RELEASE_TAG
export const GIT_COMMIT_HASH = import.meta.env.VUE_APP_GIT_COMMIT_HASH

const dynamicConfigs = {
  development: {
    API_BASE_URL: "http://localhost:3000",
    AUTH0_DOMAIN: "https://dev-0tc6bn14.eu.auth0.com",
    AUTH0_CLIENT_ID: "ZHjPOeCwYBov6eR1lxGOVYhYi4VPV8eU",
    AUTH0_AUDIENCE: "testing",
  },
  production: {
    API_BASE_URL: window.location.origin,
    AUTH0_DOMAIN: "https://dev-0tc6bn14.eu.auth0.com",
    AUTH0_CLIENT_ID: "3NjkPu1sSNJDDRzeyfPUnoNmS2VYwaUY",
    AUTH0_AUDIENCE: "testing",
  },
  local_production: {
    API_BASE_URL: window.location.origin,
    AUTH0_DOMAIN: "https://dev-0tc6bn14.eu.auth0.com",
    AUTH0_CLIENT_ID: "ZHjPOeCwYBov6eR1lxGOVYhYi4VPV8eU",
    AUTH0_AUDIENCE: "testing",
  },
}

const isRunningProductionBuildLocally =
  ENVIRONMENT === "production" && window.location.host == "localhost:8080"

const effectiveEnvironment = isRunningProductionBuildLocally ? "local_production" : ENVIRONMENT

if (!(effectiveEnvironment in dynamicConfigs)) {
  throw new Error(`Invalid effective environment: ${effectiveEnvironment}`)
}

const dynamicConfig = dynamicConfigs[effectiveEnvironment]

export const { API_BASE_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE } = dynamicConfig
