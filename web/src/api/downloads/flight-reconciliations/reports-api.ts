import { API_BASE_URL } from "@/config"
import { serializeQuery } from "@/api/base-api"
import { type FlightReconciliationsQueryOptions } from "@/api/flight-reconciliations-api"

export const reportsApi = {
  downloadPath(params: FlightReconciliationsQueryOptions = {}): string {
    const query = serializeQuery({ ...params, format: "csv" })
    return `${API_BASE_URL}/api/downloads/flight-reconciliations?${query}`
  },
}

export default reportsApi
