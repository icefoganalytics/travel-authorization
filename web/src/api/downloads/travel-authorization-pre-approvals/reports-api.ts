import { API_BASE_URL } from "@/config"
import { serializeQuery } from "@/api/base-api"
import { type TravelAuthorizationPreApprovalsQueryOptions } from "@/api/travel-authorization-pre-approvals-api"

export const reportsApi = {
  downloadPath(params: TravelAuthorizationPreApprovalsQueryOptions = {}): string {
    const query = serializeQuery({ ...params, format: "csv" })
    return `${API_BASE_URL}/api/downloads/travel-authorization-pre-approvals?${query}`
  },
}

export default reportsApi
