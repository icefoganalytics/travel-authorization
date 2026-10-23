import { enableAutoUnmount } from "@vue/test-utils"
import ResizeObserver from "resize-observer-polyfill"

import { mockHttpClient } from "@/tests/support/mock-http-client"
import { mockVisualViewport } from "@/tests/support/mock-visual-viewport"

// Vuetify's layout composables observe mounted elements.
globalThis.ResizeObserver = ResizeObserver

beforeAll(() => {
  mockVisualViewport()
})

beforeEach(() => {
  mockHttpClient()
})

enableAutoUnmount(afterEach)
