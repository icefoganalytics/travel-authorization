import { API_BASE_URL } from "@/config"
import { serializeQuery } from "@/api/base-api"
import { type FlightStatisticQueryOptions } from "@/api/flight-statistics-api"

export const reportsApi = {
  downloadPath(params: FlightStatisticQueryOptions = {}): string {
    const query = serializeQuery({ ...params, format: "csv" })
    return `${API_BASE_URL}/api/downloads/flight-statistics?${query}`
  },
}

export default reportsApi
