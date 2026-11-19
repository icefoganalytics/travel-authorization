import { API_BASE_URL } from "@/config"
import { serializeQuery } from "@/api/base-api"
import { type FlightReconciliationsQueryOptions } from "@/api/flight-reconciliations-api"

export const reportsApi = {
  downloadPath(params: FlightReconciliationsQueryOptions = {}): string {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const query = serializeQuery({ ...params, format: "csv", timeZone })
    return `${API_BASE_URL}/api/downloads/flight-reconciliations?${query}`
  },
}

export default reportsApi
