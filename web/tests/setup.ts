import { enableAutoUnmount } from "@vue/test-utils"
import ResizeObserver from "resize-observer-polyfill"

// Vuetify's layout composables observe mounted elements.
globalThis.ResizeObserver = ResizeObserver

enableAutoUnmount(afterEach)
