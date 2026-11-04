import { mount } from "@vue/test-utils"

import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"

import { mockVuetify } from "@/tests/support"

import TravelDeskTravelRequestStatusSpan from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestStatusSpan.vue"

describe("web/src/components/travel-desk-travel-requests/TravelDeskTravelRequestStatusSpan.vue", () => {
  describe("TravelDeskTravelRequestStatusSpan", () => {
    test("when a request is submitted without an officer, displays a red flag", () => {
      // Arrange
      const vuetify = mockVuetify()

      // Act
      const wrapper = mount(TravelDeskTravelRequestStatusSpan, {
        props: {
          status: TravelDeskTravelRequestStatuses.SUBMITTED,
          travelDeskOfficer: null,
        },
        global: {
          plugins: [vuetify],
        },
      })

      // Assert
      expect(wrapper.get(".mdi-flag").classes()).toContain("text-error")
    })

    test("when options are ranked without an officer, displays a yellow flag", () => {
      // Arrange
      const vuetify = mockVuetify()

      // Act
      const wrapper = mount(TravelDeskTravelRequestStatusSpan, {
        props: {
          status: TravelDeskTravelRequestStatuses.OPTIONS_RANKED,
          travelDeskOfficer: null,
        },
        global: {
          plugins: [vuetify],
        },
      })

      // Assert
      expect(wrapper.get(".mdi-flag").classes()).toContain("text-warning")
    })

    test("when a request is booked without an officer, displays a green checkmark", () => {
      // Arrange
      const vuetify = mockVuetify()

      // Act
      const wrapper = mount(TravelDeskTravelRequestStatusSpan, {
        props: {
          status: TravelDeskTravelRequestStatuses.BOOKED,
          travelDeskOfficer: null,
        },
        global: {
          plugins: [vuetify],
        },
      })

      // Assert
      expect(wrapper.get(".mdi-checkbox-marked").classes()).toContain("text-success")
    })
  })
})
