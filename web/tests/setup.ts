import { enableAutoUnmount } from "@vue/test-utils"
import ResizeObserver from "resize-observer-polyfill"

import { mockVisualViewport } from "@/tests/support/mock-visual-viewport"

vi.mock("@/api/http-client", () => ({
  default: {},
}))

beforeAll(() => {
  if (typeof window === "undefined") {
    return
  }

  globalThis.ResizeObserver = ResizeObserver
  mockVisualViewport()
})

enableAutoUnmount(afterEach)

afterEach(() => {
  if (typeof document === "undefined") {
    return
  }

  document.body.replaceChildren()
})
