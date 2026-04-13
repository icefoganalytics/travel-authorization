import http from "@/api/http-client"

export type TravelDeskFlightSegmentOrderAttributes = {
  travelDeskFlightSegmentId: number
  oldSortOrder: number
  newSortOrder: number
}[]

export const reOrderFlightSegmentsApi = {
  async create(
    travelDeskFlightOptionId: number,
    travelDeskFlightSegmentOrderAttributes: TravelDeskFlightSegmentOrderAttributes
  ): Promise<{
    message: string
  }> {
    const { data } = await http.post(
      `/api/travel-desk-flight-options/${travelDeskFlightOptionId}/re-order-flight-segments`,
      travelDeskFlightSegmentOrderAttributes
    )
    return data
  },
}

export default reOrderFlightSegmentsApi
