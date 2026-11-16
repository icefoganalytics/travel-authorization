import { flushPromises, mount } from "@vue/test-utils"
import qs from "qs"

import { mockVuetify } from "@/tests/support"

import ExportToCsvButton from "@/components/flight-reconciliations/ExportToCsvButton.vue"

describe("web/src/components/flight-reconciliations/ExportToCsvButton.vue", () => {
  describe("ExportToCsvButton", () => {
    test("when selected records change, submits the current selection and ordering", async () => {
      // Arrange
      const submittedUrls: string[] = []
      vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(function (
        this: HTMLFormElement
      ) {
        submittedUrls.push(this.action)
      })
      const vuetify = mockVuetify()
      const wrapper = mount(ExportToCsvButton, {
        props: {
          flightReconciliationIds: [1],
          order: [["invoiceBookingDate", "DESC"]],
        },
        global: {
          plugins: [vuetify],
        },
      })

      // Act
      await wrapper.setProps({ flightReconciliationIds: [2, 3] })
      await wrapper.get("form").trigger("submit")
      await flushPromises()
      const submittedUrl = new URL(submittedUrls[0])
      const query = qs.parse(submittedUrl.search, { ignoreQueryPrefix: true })

      // Assert
      expect(query).toEqual({
        format: "csv",
        where: {
          id: ["2", "3"],
        },
        order: [["invoiceBookingDate", "DESC"]],
      })
    })

    test("when no records are selected, does not submit an unrestricted download", async () => {
      // Arrange
      const submit = vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(() => {})
      const vuetify = mockVuetify()
      const wrapper = mount(ExportToCsvButton, {
        props: {
          flightReconciliationIds: [],
        },
        global: {
          plugins: [vuetify],
        },
      })

      // Act
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(submit).not.toHaveBeenCalled()
    })
  })
})
