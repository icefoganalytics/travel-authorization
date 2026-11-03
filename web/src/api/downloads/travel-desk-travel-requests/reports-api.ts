import { API_BASE_URL } from "@/config"
import { serializeQuery } from "@/api/base-api"
import { type TravelDeskTravelRequestsQueryOptions } from "@/api/travel-desk-travel-requests-api"

export const reportsApi = {
  downloadPath(format: "csv" | "pdf", params: TravelDeskTravelRequestsQueryOptions = {}): string {
    const query = serializeQuery({ ...params, format })
    return `${API_BASE_URL}/api/downloads/travel-desk-travel-requests?${query}`
  },
}

export default reportsApi
