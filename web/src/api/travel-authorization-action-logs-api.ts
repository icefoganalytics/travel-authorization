import http from "@/api/http-client"
import { type QueryOptions, type WhereOptions } from "@/api/base-api"

/** Keep in sync with api/src/models/travel-authorization-action-log.ts */
export type TravelAuthorizationActionLog = {
  id: number
  travelAuthorizationId: number
  actorId: number
  assigneeId: number
  action: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export type TravelAuthorizationActionLogWhereOptions = WhereOptions<
  TravelAuthorizationActionLog,
  "id" | "travelAuthorizationId" | "actorId" | "assigneeId" | "action"
>

export type TravelAuthorizationActionLogsQueryOptions = QueryOptions<
  TravelAuthorizationActionLogWhereOptions,
  Record<never, never>
>

export const travelAuthorizationActionLogsApi = {
  async list(params: TravelAuthorizationActionLogsQueryOptions = {}): Promise<{
    travelAuthorizationActionLogs: TravelAuthorizationActionLog[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-authorization-action-logs", {
      params,
    })
    return data
  },
}

export default travelAuthorizationActionLogsApi
