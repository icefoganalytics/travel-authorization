// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { nextTick, reactive } from "vue"
import { DOMWrapper, enableAutoUnmount, flushPromises, mount } from "@vue/test-utils"
import { createVuetify } from "vuetify"
import ResizeObserver from "resize-observer-polyfill"

import locationsApi from "@/api/locations-api"

import TravelerDetails from "@/modules/travelDesk/views/Requests/Components/TravelerDetails.vue"

vi.mock("@/api/http-client", () => ({
  default: {},
}))

vi.mock("@/api/locations-api", () => ({
  default: {
    list: vi.fn(),
  },
}))

enableAutoUnmount(afterEach)

describe("web/src/modules/travelDesk/views/Requests/Components/TravelerDetails.vue", () => {
  describe("TravelerDetails", () => {
    beforeEach(() => {
      vi.stubGlobal("ResizeObserver", ResizeObserver)
      vi.stubGlobal(
        "visualViewport",
        Object.assign(new EventTarget(), {
          width: 1024,
          height: 768,
          offsetLeft: 0,
          offsetTop: 0,
          scale: 1,
        })
      )
      vi.mocked(locationsApi.list).mockResolvedValue({
        locations: [
          {
            id: 2,
            city: "Vancouver",
            province: "BC",
            createdAt: "2026-01-01",
            updatedAt: "2026-01-01",
          },
        ],
        totalCount: 1,
      })
    })

    afterEach(() => {
      document.body.replaceChildren()
      vi.unstubAllGlobals()
    })

    test("when a city is selected, the parent-owned request contains its province", async () => {
      // Arrange
      const travelerDetails = reactive({
        travelAuthorizationId: 1,
        city: "Whitehorse (YT)",
        province: "YT",
      })
      const wrapper = mount(TravelerDetails, {
        props: {
          travelerDetails,
          readonly: false,
        },
        attachTo: document.body,
        global: {
          plugins: [createVuetify()],
        },
      })
      await flushPromises()

      // Act
      const cityInput = wrapper.get<HTMLInputElement>(".v-autocomplete input")
      cityInput.element.focus()
      await nextTick()
      await cityInput.setValue("Vancouver")
      await cityInput.trigger("keydown", { key: "ArrowDown" })
      await flushPromises()
      const cityOption = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
        (element) => element.textContent?.trim() === "Vancouver (BC)"
      )
      if (!cityOption) {
        throw new Error("Vancouver (BC) city option was not found")
      }

      await new DOMWrapper(cityOption).trigger("click")
      await flushPromises()

      // Assert
      expect(travelerDetails.province).toBe("BC")
    })
  })
})
