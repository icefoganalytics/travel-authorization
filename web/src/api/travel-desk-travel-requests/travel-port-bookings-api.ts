import http from "@/api/http-client"

export type TravelPortBooking = {
  recordLocator: string
}

export type TravelPortBookingsQueryOptions = {
  search: string
  page: number
  perPage: number
}

export const travelPortBookingsApi = {
  async list(
    travelDeskTravelRequestId: number,
    params: TravelPortBookingsQueryOptions,
    options: { signal?: AbortSignal } = {}
  ): Promise<{ travelPortBookings: TravelPortBooking[]; totalCount: number }> {
    const { data } = await http.get<{
      travelPortBookings: TravelPortBooking[]
      totalCount: number
    }>(`/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travel-port-bookings`, {
      params,
      ...options,
    })
    return data
  },
  async update(travelDeskTravelRequestId: number, recordLocator: string | null): Promise<void> {
    await http.put(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travel-port-booking`,
      { recordLocator }
    )
  },
}
