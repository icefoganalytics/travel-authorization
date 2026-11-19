import { flushPromises } from "@vue/test-utils"

import { mountWithDefaultPlugins } from "@/tests/support"

import ExportToCsvButton from "@/components/flight-reconciliations/ExportToCsvButton.vue"

describe("web/src/components/flight-reconciliations/ExportToCsvButton.vue", () => {
  describe("ExportToCsvButton", () => {
    const browserTimeZone = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)

    test("when selected records change, submits the current selection and ordering", async () => {
      // Arrange
      const submittedUrls: string[] = []
      vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(function (
        this: HTMLFormElement
      ) {
        submittedUrls.push(this.action)
      })
      const wrapper = mountWithDefaultPlugins(ExportToCsvButton, {
        props: {
          where: {
            id: [1],
            reconciled: true,
          },
          order: [["invoiceBookingDate", "DESC"]],
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

      // Assert
      expect(submittedUrls).toEqual([
        "http://api.example.test/api/downloads/flight-reconciliations" +
          "?where%5Bid%5D%5B0%5D=2&where%5Bid%5D%5B1%5D=3&where%5Breconciled%5D=true" +
          `&order%5B0%5D%5B0%5D=invoiceBookingDate&order%5B0%5D%5B1%5D=DESC&format=csv&timeZone=${browserTimeZone}`,
      ])
    })

    test("when no records are selected, submits all matching records in the current order", async () => {
      // Arrange
      const submittedUrls: string[] = []
      vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(function (
        this: HTMLFormElement
      ) {
        submittedUrls.push(this.action)
      })
      const wrapper = mountWithDefaultPlugins(ExportToCsvButton, {
        props: {
          filters: { invoiceBookingDateBetween: ["2026-11-01", "2026-11-30"] },
          where: { reconciled: false },
          order: [["invoiceBookingDate", "DESC"]],
        },
      })

      // Act
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(submittedUrls).toEqual([
        "http://api.example.test/api/downloads/flight-reconciliations" +
          "?where%5Breconciled%5D=false" +
          "&filters%5BinvoiceBookingDateBetween%5D%5B0%5D=2026-11-01" +
          "&filters%5BinvoiceBookingDateBetween%5D%5B1%5D=2026-11-30" +
          `&order%5B0%5D%5B0%5D=invoiceBookingDate&order%5B0%5D%5B1%5D=DESC&format=csv&timeZone=${browserTimeZone}`,
      ])
    })
  })
})
