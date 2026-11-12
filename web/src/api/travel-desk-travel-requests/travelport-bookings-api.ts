import http from "@/api/http-client"

export type TravelportBooking = {
  recordLocator: string
}

export type TravelportBookingsQueryOptions = {
  search: string
  page: number
  perPage: number
}

export const travelportBookingsApi = {
  async list(
    travelDeskTravelRequestId: number,
    params: TravelportBookingsQueryOptions,
    options: { signal?: AbortSignal } = {}
  ): Promise<{ travelportBookings: TravelportBooking[]; totalCount: number }> {
    const { data } = await http.get<{
      travelportBookings: TravelportBooking[]
      totalCount: number
    }>(`/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travelport-bookings`, {
      params,
      ...options,
    })
    return data
  },
  async update(travelDeskTravelRequestId: number, recordLocator: string | null): Promise<void> {
    await http.put(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travelport-booking`,
      { recordLocator }
    )
  },
}
