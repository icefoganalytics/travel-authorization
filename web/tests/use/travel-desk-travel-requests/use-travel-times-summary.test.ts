import { flushPromises } from "@vue/test-utils"
import { effectScope, ref, type EffectScope } from "vue"

import travelAuthorizationsApi from "@/api/travel-authorizations-api"
import travelDeskFlightSegmentsApi, {
  type TravelDeskFlightSegmentAsIndex,
} from "@/api/travel-desk-flight-segments-api"
import { travelDeskFlightSegmentFactory } from "@/tests/factories"

import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

vi.mock("@/api/travel-authorizations-api")
vi.mock("@/api/travel-desk-flight-segments-api")

describe("web/src/use/travel-desk-travel-requests/use-travel-times-summary.ts", () => {
  describe("useTravelTimesSummary", () => {
    let scope: EffectScope

    beforeEach(() => {
      scope = effectScope()
      vi.mocked(travelAuthorizationsApi.list).mockResolvedValue({
        travelAuthorizations: [],
        totalCount: 0,
      })
    })

    afterEach(() => {
      scope.stop()
    })

    test("when flight boundaries use the API timestamp format, exposes their UTC dates and times", async () => {
      // Arrange
      const firstFlightSegment = travelDeskFlightSegmentFactory.build({
        departAt: "2026-12-10T08:35:00.000Z",
        arriveAt: "2026-12-10T11:10:00.000Z",
      })
      const lastFlightSegment = travelDeskFlightSegmentFactory.build({
        departAt: "2026-12-12T17:20:00.000Z",
        arriveAt: "2026-12-12T19:45:00.000Z",
      })
      vi.mocked(travelDeskFlightSegmentsApi.list)
        .mockResolvedValueOnce({ travelDeskFlightSegments: [firstFlightSegment], totalCount: 4 })
        .mockResolvedValueOnce({ travelDeskFlightSegments: [lastFlightSegment], totalCount: 4 })

      // Act
      const summary = scope.run(() => useTravelTimesSummary(ref(42)))
      await flushPromises()

      // Assert
      expect(summary?.flightSchedule.value).toEqual({
        startDate: "2026-12-10",
        startTime: "08:35",
        endDate: "2026-12-12",
        endTime: "19:45",
      })
    })

    test("when the arrival has no time, keeps the incomplete schedule unavailable", async () => {
      // Arrange
      const flightSegment = travelDeskFlightSegmentFactory.build({
        departAt: "2026-12-10T08:35:00.000Z",
        arriveAt: "2026-12-12",
      })
      vi.mocked(travelDeskFlightSegmentsApi.list).mockResolvedValue({
        travelDeskFlightSegments: [flightSegment],
        totalCount: 1,
      })

      // Act
      const summary = scope.run(() => useTravelTimesSummary(ref(42)))
      await flushPromises()

      // Assert
      expect(summary?.flightSchedule.value).toBeNull()
    })

    test("when the last boundary is refreshing, withholds the previously loaded schedule", async () => {
      // Arrange
      const firstFlightSegment = travelDeskFlightSegmentFactory.build({
        departAt: "2026-12-10T08:35:00.000Z",
        arriveAt: "2026-12-10T11:10:00.000Z",
      })
      const lastFlightSegment = travelDeskFlightSegmentFactory.build({
        departAt: "2026-12-12T17:20:00.000Z",
        arriveAt: "2026-12-12T19:45:00.000Z",
      })
      const lastFlightResponse = Promise.withResolvers<{
        travelDeskFlightSegments: TravelDeskFlightSegmentAsIndex[]
        totalCount: number
      }>()
      vi.mocked(travelDeskFlightSegmentsApi.list)
        .mockResolvedValueOnce({ travelDeskFlightSegments: [firstFlightSegment], totalCount: 4 })
        .mockResolvedValueOnce({ travelDeskFlightSegments: [lastFlightSegment], totalCount: 4 })
      const summary = scope.run(() => useTravelTimesSummary(ref(42)))
      if (summary === undefined) throw new Error("Summary requires an active effect scope")

      await flushPromises()
      vi.mocked(travelDeskFlightSegmentsApi.list)
        .mockResolvedValueOnce({ travelDeskFlightSegments: [firstFlightSegment], totalCount: 4 })
        .mockReturnValueOnce(lastFlightResponse.promise)

      // Act
      void summary.refresh()
      await flushPromises()

      // Assert
      expect(summary.flightSchedule.value).toBeNull()
    })

    test("when a flight refresh fails, does not expose the previously loaded schedule", async () => {
      // Arrange
      const flightSegment = travelDeskFlightSegmentFactory.build({
        departAt: "2026-12-10T08:35:00.000Z",
        arriveAt: "2026-12-12T19:45:00.000Z",
      })
      vi.mocked(travelDeskFlightSegmentsApi.list).mockResolvedValue({
        travelDeskFlightSegments: [flightSegment],
        totalCount: 1,
      })
      vi.spyOn(console, "error").mockImplementation(() => {})
      const summary = scope.run(() => useTravelTimesSummary(ref(42)))
      if (summary === undefined) throw new Error("Summary requires an active effect scope")

      await flushPromises()
      vi.mocked(travelDeskFlightSegmentsApi.list).mockRejectedValueOnce(new Error("Unavailable"))

      // Act
      await summary.refresh().catch((error: Error) => error)

      // Assert
      expect(summary.flightSchedule.value).toBeNull()
    })
  })
})
