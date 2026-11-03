import { AUTH0_INJECTION_KEY } from "@auth0/auth0-vue"
import { config } from "@vue/test-utils"

export function mockAuth0() {
  const auth0Mock = {
    getAccessTokenSilently: vi.fn().mockResolvedValue("test-access-token"),
  }

  config.global.provide = {
    ...config.global.provide,
    [AUTH0_INJECTION_KEY]: auth0Mock,
  }

  return auth0Mock
}

export default mockAuth0
