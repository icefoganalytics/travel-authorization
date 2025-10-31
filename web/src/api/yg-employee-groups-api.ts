import http from "@/api/http-client"

import { type FiltersOptions, type QueryOptions, type WhereOptions } from "@/api/base-api"

export type YgEmployeeGroup = {
  id: number
  department: string
  division: string | null
  branch: string | null
  unit: string | null
  order: number
  lastSyncSuccessAt: string | null
  lastSyncFailureAt: string | null
  createdAt: string
  updatedAt: string
}

export type YgEmployeeGroupAsShow = Pick<
  YgEmployeeGroup,
  | "id"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "order"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "createdAt"
  | "updatedAt"
>

export type YgEmployeeGroupAsIndex = Pick<
  YgEmployeeGroup,
  | "id"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "order"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "createdAt"
  | "updatedAt"
>

export type YgEmployeeGroupWhereOptions = WhereOptions<
  YgEmployeeGroup,
  "id" | "department" | "division" | "branch" | "unit" | "order"
>

export type YgEmployeeGroupFiltersOptions = FiltersOptions<{
  search: string | string[]
  isDepartment: boolean
  isDivision: boolean
  isBranch: boolean
  isUnit: boolean
}>

export type YgEmployeeGroupsQueryOptions = QueryOptions<
  YgEmployeeGroupWhereOptions,
  YgEmployeeGroupFiltersOptions
>

export const ygEmployeeGroupsApi = {
  async list(params: YgEmployeeGroupsQueryOptions = {}): Promise<{
    ygEmployeeGroups: YgEmployeeGroupAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/yg-employee-groups", { params })
    return data
  },

  async fetch(ygEmployeeId: number): Promise<YgEmployeeGroupAsShow> {
    const { data } = await http.get(`/api/yg-employee-groups/${ygEmployeeId}`)
    return data
  },

  // Special actions
  async sync(): Promise<void> {
    const { data } = await http.post("/api/yg-employee-groups/sync")
    return data
  },
}

export default ygEmployeeGroupsApi
