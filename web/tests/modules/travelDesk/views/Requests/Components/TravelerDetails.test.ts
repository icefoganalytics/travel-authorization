// @vitest-environment jsdom

import { DOMWrapper, flushPromises, mount } from "@vue/test-utils"
import { nextTick, reactive } from "vue"
import { isUndefined } from "lodash"

import locationsApi from "@/api/locations-api"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

import { locationFactory, travelDeskTravelRequestFactory } from "@/tests/factories"
import { mockVuetify } from "@/tests/support"

import TravelerDetails from "@/modules/travelDesk/views/Requests/Components/TravelerDetails.vue"

describe("web/src/modules/travelDesk/views/Requests/Components/TravelerDetails.vue", () => {
  describe("TravelerDetails", () => {
    test("when a city is selected, the parent-owned request contains its province", async () => {
      // Arrange
      const vancouver = locationFactory.build({ city: "Vancouver", province: "BC" })
      vi.spyOn(locationsApi, "list").mockResolvedValue({
        locations: [vancouver],
        totalCount: 1,
      })
      const travelerDetails = reactive(
        travelDeskTravelRequestFactory.build({ city: "Whitehorse (YT)", province: "YT" })
      )
      const wrapper = mount(TravelerDetails, {
        props: {
          travelerDetails,
          readonly: false,
        },
        attachTo: document.body,
        global: {
          plugins: [mockVuetify()],
        },
      })
      await flushPromises()

      // Act
      const cityInput = wrapper.getComponent(LocationsAutocomplete).get<HTMLInputElement>("input")
      cityInput.element.focus()
      await nextTick()
      await cityInput.setValue("Vancouver")
      await cityInput.trigger("keydown", { key: "ArrowDown" })
      await flushPromises()
      const cityOption = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
        (element) => element.textContent?.trim() === "Vancouver (BC)"
      )
      if (isUndefined(cityOption)) {
        throw new Error("Vancouver (BC) city option was not found")
      }

      await new DOMWrapper(cityOption).trigger("click")
      await flushPromises()

      // Assert
      expect(travelerDetails.province).toBe("BC")
    })
  })
})
