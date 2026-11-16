import { flushPromises, mount } from "@vue/test-utils"

import { travelAuthorizationPreApprovalFactory } from "@/tests/factories/travel-authorization-pre-approval-factory"
import { mockHttpGetRoute, mockVuetify } from "@/tests/support"

import TravelAuthorizationPreApprovalsExportToCsvButton from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsExportToCsvButton.vue"

describe("web/src/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsExportToCsvButton.vue", () => {
  describe("TravelAuthorizationPreApprovalsExportToCsvButton", () => {
    beforeEach(() => {
      vi.stubGlobal(
        "URL",
        class extends URL {
          static createObjectURL = vi.fn(() => "blob:csv-download")
        }
      )
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    })

    test("when pre-approvals are exported, downloads a filename with spaces and commas", async () => {
      // Arrange
      const preApproval = travelAuthorizationPreApprovalFactory.build()
      mockHttpGetRoute("/api/travel-authorization-pre-approvals", () => ({
        travelAuthorizationPreApprovals: [preApproval],
        totalCount: 1,
      }))
      const wrapper = mount(TravelAuthorizationPreApprovalsExportToCsvButton, {
        global: {
          plugins: [mockVuetify()],
        },
      })

      // Act
      await wrapper.get("button").trigger("click")
      await flushPromises()

      // Assert
      const downloadLink = vi.mocked(HTMLAnchorElement.prototype.click).mock.contexts[0]
      expect(downloadLink).toMatchObject({
        download: expect.stringMatching(
          /^Export, Travel Pre-Approval Requests, \d{4}-\d{2}-\d{2}_\d{4}\.csv$/
        ),
      })
    })

    test.each([
      {
        condition: "text contains commas, quotes, and line breaks",
        purpose: 'Meeting, "planning"\nFollow-up',
        expectedPurpose: '"Meeting, ""planning""\nFollow-up"',
      },
      {
        condition: "optional text is absent",
        purpose: null,
        expectedPurpose: '""',
      },
    ])("when $condition, preserves the exported cells", async ({ purpose, expectedPurpose }) => {
      // Arrange
      const preApproval = travelAuthorizationPreApprovalFactory.build({
        location: "Whitehorse",
        estimatedCost: 25,
        purpose,
      })
      mockHttpGetRoute("/api/travel-authorization-pre-approvals", () => ({
        travelAuthorizationPreApprovals: [preApproval],
        totalCount: 1,
      }))
      const wrapper = mount(TravelAuthorizationPreApprovalsExportToCsvButton, {
        global: {
          plugins: [mockVuetify()],
        },
      })

      // Act
      await wrapper.get("button").trigger("click")
      await flushPromises()
      const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0]
      const { promise, resolve, reject } = Promise.withResolvers<string>()
      const reader = new FileReader()
      reader.onload = () => {
        const bytes = reader.result as ArrayBuffer
        resolve(new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes))
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(blob as Blob)
      const csv = await promise

      // Assert
      expect(csv).toEqual(
        '\uFEFF"Name","Department","Branch","Travel Date","Location","Purpose","Estimated Cost","Reason","Status","Notes"\r\n' +
          `"","","","","Whitehorse",${expectedPurpose},"$25.00","","draft",""\r\n`
      )
    })
  })
})
