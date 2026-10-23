// @vitest-environment jsdom

import { DOMWrapper, flushPromises, mount } from "@vue/test-utils"
import { nextTick, reactive } from "vue"
import { isUndefined } from "lodash"
import { VTextField } from "vuetify/components"

import locationsApi from "@/api/locations-api"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

import { locationFactory, travelDeskTravelRequestFactory } from "@/tests/factories"
import { mockVuetify } from "@/tests/support"

import TravelerDetailsFormCard from "@/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue"

describe("web/src/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue", () => {
  describe("TravelerDetailsFormCard", () => {
    describe("city selection", () => {
      test("when the traveller selects a different city, its province fills the form", async () => {
        // Arrange
        const vancouver = locationFactory.build({ city: "Vancouver", province: "BC" })
        vi.spyOn(locationsApi, "list").mockResolvedValue({
          locations: [vancouver],
          totalCount: 1,
        })
        const travelDeskTravelRequest = reactive(
          travelDeskTravelRequestFactory.build({ city: "Whitehorse (YT)", province: "YT" })
        )
        const wrapper = mount(TravelerDetailsFormCard, {
          props: {
            modelValue: travelDeskTravelRequest,
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
        const cityOption = Array.from(
          document.querySelectorAll<HTMLElement>('[role="option"]')
        ).find((element) => element.textContent?.trim() === "Vancouver (BC)")
        if (isUndefined(cityOption)) {
          throw new Error("Vancouver (BC) city option was not found")
        }

        await new DOMWrapper(cityOption).trigger("click")
        await flushPromises()

        // Assert
        expect(travelDeskTravelRequest.province).toBe("BC")
      })

      test("when cities share a name, the selected province replaces the previous one", async () => {
        // Arrange
        const albertaLocation = locationFactory.build({ city: "Lloydminster", province: "AB" })
        const saskatchewanLocation = locationFactory.build({ city: "Lloydminster", province: "SK" })
        vi.spyOn(locationsApi, "list").mockResolvedValue({
          locations: [albertaLocation, saskatchewanLocation],
          totalCount: 2,
        })
        const travelDeskTravelRequest = reactive(
          travelDeskTravelRequestFactory.build({ city: "Lloydminster (AB)", province: "AB" })
        )
        const wrapper = mount(TravelerDetailsFormCard, {
          props: {
            modelValue: travelDeskTravelRequest,
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
        await cityInput.setValue("Lloydminster")
        await cityInput.trigger("keydown", { key: "ArrowDown" })
        await flushPromises()
        const cityOption = Array.from(
          document.querySelectorAll<HTMLElement>('[role="option"]')
        ).find((element) => element.textContent?.trim() === "Lloydminster (SK)")
        if (isUndefined(cityOption)) {
          throw new Error("Lloydminster (SK) city option was not found")
        }

        await new DOMWrapper(cityOption).trigger("click")
        await flushPromises()

        // Assert
        expect(travelDeskTravelRequest.province).toBe("SK")
      })
    })

    describe("saved and manual provinces", () => {
      test("when a saved request loads, its edited province is retained", async () => {
        // Arrange
        const whitehorse = locationFactory.build({ city: "Whitehorse", province: "YT" })
        vi.spyOn(locationsApi, "list").mockResolvedValue({
          locations: [whitehorse],
          totalCount: 1,
        })
        const travelDeskTravelRequest = reactive(
          travelDeskTravelRequestFactory.build({
            city: "Whitehorse (YT)",
            province: "Saved province",
          })
        )
        mount(TravelerDetailsFormCard, {
          props: {
            modelValue: travelDeskTravelRequest,
          },
          attachTo: document.body,
          global: {
            plugins: [mockVuetify()],
          },
        })

        // Act
        await flushPromises()

        // Assert
        expect(travelDeskTravelRequest.province).toBe("Saved province")
      })

      test("when a saved request replaces the form state, its province is retained", async () => {
        // Arrange
        const whitehorse = locationFactory.build({ city: "Whitehorse", province: "YT" })
        const vancouver = locationFactory.build({ city: "Vancouver", province: "BC" })
        vi.spyOn(locationsApi, "list").mockResolvedValue({
          locations: [whitehorse, vancouver],
          totalCount: 2,
        })
        const travelDeskTravelRequest = reactive(
          travelDeskTravelRequestFactory.build({ city: "Vancouver (BC)", province: "BC" })
        )
        const savedTravelDeskTravelRequest = reactive(
          travelDeskTravelRequestFactory.build({
            city: "Whitehorse (YT)",
            province: "Saved province",
          })
        )
        const wrapper = mount(TravelerDetailsFormCard, {
          props: {
            modelValue: travelDeskTravelRequest,
          },
          attachTo: document.body,
          global: {
            plugins: [mockVuetify()],
          },
        })
        await flushPromises()

        // Act
        await wrapper.setProps({
          modelValue: savedTravelDeskTravelRequest,
        })
        await flushPromises()

        // Assert
        expect(savedTravelDeskTravelRequest.province).toBe("Saved province")
      })

      test("when locations finish loading after a manual edit, the edit is retained", async () => {
        // Arrange
        const whitehorse = locationFactory.build({ city: "Whitehorse", province: "YT" })
        let finishLoadingLocations: (() => void) | undefined
        const locationsReady = new Promise<void>((resolve) => {
          finishLoadingLocations = resolve
        })
        vi.spyOn(locationsApi, "list").mockImplementation(async () => {
          await locationsReady
          return {
            locations: [whitehorse],
            totalCount: 1,
          }
        })
        const travelDeskTravelRequest = reactive(
          travelDeskTravelRequestFactory.build({ city: "Whitehorse (YT)", province: "YT" })
        )
        const wrapper = mount(TravelerDetailsFormCard, {
          props: {
            modelValue: travelDeskTravelRequest,
          },
          attachTo: document.body,
          global: {
            plugins: [mockVuetify()],
          },
        })
        const provinceField = wrapper
          .findAllComponents(VTextField)
          .find((field) => field.props("label") === "Province *")
        if (isUndefined(provinceField)) {
          throw new Error("Province field was not found")
        }

        // Act
        await provinceField.get<HTMLInputElement>("input").setValue("Manual province")
        if (isUndefined(finishLoadingLocations)) {
          throw new Error("Location request was not initialized")
        }

        finishLoadingLocations()
        await flushPromises()

        // Assert
        expect(travelDeskTravelRequest.province).toBe("Manual province")
      })
    })
  })
})
