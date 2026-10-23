import { MAX_PER_PAGE } from "@/api/base-api"

import travelDeskTravelRequestFactory from "@/tests/factories/travel-desk-travel-request-factory"

import travelDeskTravelRequestsApi from "@/api/travel-desk-travel-requests-api"

vi.mock("@/api/http-client", () => ({
  default: {},
}))

describe("web/src/api/travel-desk-travel-requests-api.ts", () => {
  describe("travelDeskTravelRequestsApi", () => {
    describe("listSelected", () => {
      test("when the selection spans API pages, returns every selected request in order", async () => {
        // Arrange
        const requests = travelDeskTravelRequestFactory.buildList(MAX_PER_PAGE + 1)
        const selectedIds = requests.map((request) => request.id)
        vi.spyOn(travelDeskTravelRequestsApi, "list").mockImplementation(
          async ({ page = 1, perPage = 10 } = {}) => ({
            travelDeskTravelRequests: requests.slice((page - 1) * perPage, page * perPage),
            totalCount: requests.length,
          })
        )

        // Act
        const selectedRequests = await travelDeskTravelRequestsApi.listSelected(selectedIds)

        // Assert
        const returnedIds = selectedRequests.map((request) => request.id)
        expect(returnedIds).toEqual(selectedIds)
      })

      test("when a selected request is unavailable, rejects instead of returning a partial selection", async () => {
        // Arrange
        const request1 = travelDeskTravelRequestFactory.build()
        const request2 = travelDeskTravelRequestFactory.build()
        vi.spyOn(travelDeskTravelRequestsApi, "list").mockResolvedValue({
          travelDeskTravelRequests: [request1],
          totalCount: 1,
        })

        // Act / Assert
        await expect(
          travelDeskTravelRequestsApi.listSelected([request1.id, request2.id])
        ).rejects.toThrow()
      })

      test("when duplicate rows hide a missing selected request, rejects the incomplete selection", async () => {
        // Arrange
        const request1 = travelDeskTravelRequestFactory.build()
        const request2 = travelDeskTravelRequestFactory.build()
        vi.spyOn(travelDeskTravelRequestsApi, "list").mockResolvedValue({
          travelDeskTravelRequests: [request1, request1],
          totalCount: 2,
        })

        // Act / Assert
        await expect(
          travelDeskTravelRequestsApi.listSelected([request1.id, request2.id])
        ).rejects.toThrow()
      })

      test("when no requests are selected, returns no records", async () => {
        // Arrange
        vi.spyOn(travelDeskTravelRequestsApi, "list").mockResolvedValue({
          travelDeskTravelRequests: travelDeskTravelRequestFactory.buildList(2),
          totalCount: 2,
        })

        // Act
        const selectedRequests = await travelDeskTravelRequestsApi.listSelected([])

        // Assert
        expect(selectedRequests).toEqual([])
      })
    })
  })
})
