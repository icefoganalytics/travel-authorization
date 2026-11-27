import { flushPromises, mount } from "@vue/test-utils"
import type { AxiosInstance } from "axios"
import type { MockedFunction } from "vitest"

import { UserRoles } from "@/api/current-user-api"
import useCurrentUser from "@/use/use-current-user"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelAuthorizationPreApprovalTravelerAttributesFormCard from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalTravelerAttributesFormCard.vue"
import TravelPurposeTextSelect from "@/components/travel-purposes/TravelPurposeTextSelect.vue"
import YgEmployeeAutocomplete from "@/components/yg-employees/YgEmployeeAutocomplete.vue"
import BranchAutocomplete from "@/components/yg-employee-groups/BranchAutocomplete.vue"
import DepartmentAutocomplete from "@/components/yg-employee-groups/DepartmentAutocomplete.vue"

import { mockHttpClient, mockHttpGetRoutes, mockRouter, mockVuetify } from "@/tests/support"

import TravelPreApprovalNewPage from "@/pages/travel-pre-approvals/TravelPreApprovalNewPage.vue"

describe("web/src/pages/travel-pre-approvals/TravelPreApprovalNewPage.vue", () => {
  describe("TravelPreApprovalNewPage", () => {
    let post: MockedFunction<AxiosInstance["post"]>

    beforeEach(async () => {
      post = mockHttpClient().post

      mockHttpGetRoutes({
        "/api/current-user": () => ({
          user: {
            department: "Health and Social Services",
            roles: [UserRoles.ADMIN],
          },
        }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
        "/api/travel-purposes": () => ({ travelPurposes: [], totalCount: 0 }),
        "/api/yg-employee-groups": () => ({ ygEmployeeGroups: [], totalCount: 0 }),
        "/api/yg-employees": () => ({ ygEmployees: [], totalCount: 0 }),
      })
      await useCurrentUser().fetch()
    })

    afterAll(() => {
      useCurrentUser().reset()
    })

    test("when required fields and a traveler are entered, it submits the selected department only on the parent", async () => {
      // Arrange
      const router = mockRouter([
        {
          path: "/",
          name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
          component: { template: "<div />" },
        },
      ])
      await router.push("/")
      const wrapper = mount(TravelPreApprovalNewPage, {
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      // Act
      await wrapper.getComponent(DepartmentAutocomplete).setValue("Health and Social Services")
      await wrapper.getComponent(BranchAutocomplete).setValue("Finance")
      await wrapper.getComponent(TravelPurposeTextSelect).setValue("Training")
      await wrapper.getComponent(LocationsAutocomplete).setValue("Whitehorse (YT)")
      await wrapper.get('input[type="number"]').setValue("100")
      const [startDate, endDate] = wrapper.findAll('input[type="date"]')
      await startDate.setValue("2026-12-01")
      await endDate.setValue("2026-12-02")
      const travelerCard = wrapper.getComponent(
        TravelAuthorizationPreApprovalTravelerAttributesFormCard
      )
      await travelerCard.getComponent(YgEmployeeAutocomplete).setValue("Sam Smith")
      await travelerCard.get("button.bg-primary").trigger("click")
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(post).toHaveBeenCalledWith(
        "/api/travel-authorization-pre-approvals",
        expect.objectContaining({
          department: "Health and Social Services",
          estimatedCost: 100,
          location: "Whitehorse (YT)",
          profilesAttributes: [
            {
              profileName: "Sam Smith",
              branch: "Finance",
            },
          ],
        })
      )
    })

    test("when a department has not been selected, it does not submit the pre-approval", async () => {
      // Arrange
      const router = mockRouter([
        {
          path: "/",
          name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
          component: { template: "<div />" },
        },
      ])
      await router.push("/")
      const wrapper = mount(TravelPreApprovalNewPage, {
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      // Act
      await wrapper.getComponent(TravelPurposeTextSelect).setValue("Training")
      await wrapper.getComponent(LocationsAutocomplete).setValue("Whitehorse (YT)")
      await wrapper.get('input[type="number"]').setValue("100")
      const [startDate, endDate] = wrapper.findAll('input[type="date"]')
      await startDate.setValue("2026-12-01")
      await endDate.setValue("2026-12-02")
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(post).not.toHaveBeenCalled()
    })
  })
})
