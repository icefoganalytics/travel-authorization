// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { nextTick, reactive } from "vue"
import {
  DOMWrapper,
  enableAutoUnmount,
  flushPromises,
  mount,
  type VueWrapper,
} from "@vue/test-utils"
import { createVuetify } from "vuetify"
import ResizeObserver from "resize-observer-polyfill"

import locationsApi, { type LocationAsIndex } from "@/api/locations-api"
import {
  TravelDeskTravelRequestStatuses,
  type TravelDeskTravelRequest,
} from "@/api/travel-desk-travel-requests-api"

import TravelerDetailsFormCard from "@/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue"

vi.mock("@/api/http-client", () => ({
  default: {},
}))

vi.mock("@/api/locations-api", () => ({
  default: {
    list: vi.fn(),
  },
}))

const locations: LocationAsIndex[] = [
  { id: 1, city: "Whitehorse", province: "YT", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: 2, city: "Vancouver", province: "BC", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: 3, city: "Lloydminster", province: "AB", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: 4, city: "Lloydminster", province: "SK", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
]

const travelDeskTravelRequest: TravelDeskTravelRequest = {
  id: 1,
  travelAuthorizationId: 1,
  travelAgencyId: null,
  invoiceNumber: null,
  legalFirstName: "Test",
  legalMiddleName: null,
  legalLastName: "Traveller",
  birthDate: "1990-01-01",
  strAddress: "123 Test Street",
  city: "Whitehorse (YT)",
  province: "YT",
  postalCode: "Y1A 1A1",
  passportCountry: null,
  passportNum: null,
  travelPurpose: "Conference",
  travelLocation: null,
  travelNotes: null,
  busPhone: "867-555-0100",
  busEmail: "traveller@example.test",
  travelContact: false,
  travelPhone: null,
  travelEmail: null,
  additionalInformation: null,
  status: TravelDeskTravelRequestStatuses.DRAFT,
  travelDeskOfficer: null,
  isInternationalTravel: false,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
}

function mountForm(request: TravelDeskTravelRequest) {
  return mount(TravelerDetailsFormCard, {
    props: {
      modelValue: request,
    },
    attachTo: document.body,
    global: {
      plugins: [createVuetify()],
    },
  })
}

function provinceInput(wrapper: VueWrapper) {
  const label = wrapper.findAll("label").find((element) => {
    return element.text() === "Province *" && element.attributes("for")
  })
  if (!label) {
    throw new Error("Province field label was not found")
  }

  return wrapper.get<HTMLInputElement>(`#${label.attributes("for")}`)
}

async function selectCity(wrapper: VueWrapper, city: string) {
  const input = wrapper.get<HTMLInputElement>(".v-autocomplete input")
  input.element.focus()
  await nextTick()
  await input.setValue(city)
  await input.trigger("keydown", { key: "ArrowDown" })
  await flushPromises()

  const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    (element) => element.textContent?.trim() === city
  )
  if (!option) {
    throw new Error(`City option ${city} was not found`)
  }

  await new DOMWrapper(option).trigger("click")
  await flushPromises()
}

enableAutoUnmount(afterEach)

describe("web/src/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue", () => {
  describe("TravelerDetailsFormCard", () => {
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
      vi.mocked(locationsApi.list).mockReset()
      vi.mocked(locationsApi.list).mockResolvedValue({
        locations,
        totalCount: locations.length,
      })
    })

    afterEach(() => {
      document.body.replaceChildren()
      vi.unstubAllGlobals()
    })

    describe("city selection", () => {
      test("when the traveller selects a different city, its province fills the form", async () => {
        // Arrange
        const request = reactive({ ...travelDeskTravelRequest })
        const wrapper = mountForm(request)
        await flushPromises()

        // Act
        await selectCity(wrapper, "Vancouver (BC)")

        // Assert
        expect(provinceInput(wrapper).element.value).toBe("BC")
      })

      test("when cities share a name, the selected province replaces the previous one", async () => {
        // Arrange
        const request = reactive({
          ...travelDeskTravelRequest,
          city: "Lloydminster (AB)",
          province: "AB",
        })
        const wrapper = mountForm(request)
        await flushPromises()

        // Act
        await selectCity(wrapper, "Lloydminster (SK)")

        // Assert
        expect(provinceInput(wrapper).element.value).toBe("SK")
      })
    })

    describe("saved and manual provinces", () => {
      test("when a saved request loads, its edited province is retained", async () => {
        // Arrange
        const request = reactive({
          ...travelDeskTravelRequest,
          province: "Saved province",
        })
        const wrapper = mountForm(request)

        // Act
        await flushPromises()

        // Assert
        expect(provinceInput(wrapper).element.value).toBe("Saved province")
      })

      test("when locations finish loading after a manual edit, the edit is retained", async () => {
        // Arrange
        vi.mocked(locationsApi.list).mockImplementation(async () => {
          await nextTick()
          return { locations, totalCount: locations.length }
        })
        const request = reactive({ ...travelDeskTravelRequest })
        const wrapper = mountForm(request)

        // Act
        await provinceInput(wrapper).setValue("Manual province")
        await flushPromises()

        // Assert
        expect(provinceInput(wrapper).element.value).toBe("Manual province")
      })
    })
  })
})
