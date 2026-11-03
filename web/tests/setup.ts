import { config, enableAutoUnmount } from "@vue/test-utils"
import ResizeObserver from "resize-observer-polyfill"

import vueI18nPlugin from "@/plugins/vue-i18n-plugin"

import { mockAuth0 } from "@/tests/support/mock-auth0"
import { mockHttpClient } from "@/tests/support/mock-http-client"
import { mockVisualViewport } from "@/tests/support/mock-visual-viewport"

vi.mock("@/config", () => ({
  API_BASE_URL: "http://api.example.test",
}))

config.global.plugins.push(vueI18nPlugin)

// Vuetify's layout composables observe mounted elements.
globalThis.ResizeObserver = ResizeObserver

beforeAll(() => {
  mockVisualViewport()
})

beforeEach(() => {
  mockAuth0()
  mockHttpClient()
})

enableAutoUnmount(afterEach)
