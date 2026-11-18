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
          where: {
            id: [1],
            reconciled: true,
          },
          order: [["invoiceBookingDate", "DESC"]],
        },
        global: {
          plugins: [vuetify],
        },
      })

      // Act
      await wrapper.setProps({
        where: {
          id: [2, 3],
          reconciled: true,
        },
      })
      await wrapper.get("form").trigger("submit")
      await flushPromises()
      const submittedUrl = new URL(submittedUrls[0])
      const query = qs.parse(submittedUrl.search, { ignoreQueryPrefix: true })

      // Assert
      expect(query).toEqual({
        format: "csv",
        where: {
          id: ["2", "3"],
          reconciled: "true",
        },
        order: [["invoiceBookingDate", "DESC"]],
      })
    })

    test("when no records are selected, submits all matching records in the current order", async () => {
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
          filters: { invoiceBookingDateBetween: ["2026-11-01", "2026-11-30"] },
          where: { reconciled: false },
          order: [["invoiceBookingDate", "DESC"]],
        },
        global: {
          plugins: [vuetify],
        },
      })

      // Act
      await wrapper.get("form").trigger("submit")
      await flushPromises()
      const submittedUrl = new URL(submittedUrls[0])
      const query = qs.parse(submittedUrl.search, { ignoreQueryPrefix: true })

      // Assert
      expect(query).toEqual({
        format: "csv",
        where: {
          reconciled: "false",
        },
        filters: {
          invoiceBookingDateBetween: ["2026-11-01", "2026-11-30"],
        },
        order: [["invoiceBookingDate", "DESC"]],
      })
    })
  })
})
