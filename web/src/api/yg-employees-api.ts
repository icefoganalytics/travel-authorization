import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export type YgEmployee = {
  id: number
  email: string
  username: string
  fullName: string
  firstName: string
  lastName: string
  department: string
  division: string | null
  branch: string | null
  unit: string | null
  organization: string | null
  title: string | null
  suite: string | null
  phoneOffice: string | null
  faxOffice: string | null
  mobile: string | null
  office: string | null
  address: string | null
  poBox: string | null
  community: string | null
  postalCode: string | null
  latitude: string | null
  longitude: string | null
  mailcode: string | null
  manager: string | null
  lastSyncSuccessAt: string | null
  lastSyncFailureAt: string | null
  createdAt: string
  updatedAt: string
}

export type YgEmployeeAsShow = Pick<
  YgEmployee,
  | "id"
  | "firstName"
  | "lastName"
  | "department"
  | "fullName"
  | "email"
  | "mobile"
  | "office"
  | "address"
  | "community"
  | "postalCode"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "createdAt"
  | "updatedAt"
> & {
  businessPhone: YgEmployee["phoneOffice"]
}

export type YgEmployeeAsIndex = Pick<
  YgEmployee,
  | "id"
  | "firstName"
  | "lastName"
  | "department"
  | "fullName"
  | "email"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "createdAt"
  | "updatedAt"
> & {
  businessPhone: YgEmployee["phoneOffice"]
}

export type YgEmployeeWhereOptions = WhereOptions<
  YgEmployee,
  "id" | "email" | "department" | "division" | "branch" | "unit"
>

export type YgEmployeeFiltersOptions = FiltersOptions<{
  search: string | string[]
  excludingByFullNames: string[]
}>

export type YgEmployeesQueryOptions = QueryOptions<YgEmployeeWhereOptions, YgEmployeeFiltersOptions>

export const ygEmployeesApi = {
  async list(params: YgEmployeesQueryOptions = {}): Promise<{
    ygEmployees: YgEmployeeAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/yg-employees", { params })
    return data
  },

  async get(ygEmployeeId: number): Promise<{
    ygEmployee: YgEmployeeAsShow
    policy: Policy
  }> {
    const { data } = await http.get(`/api/yg-employees/${ygEmployeeId}`)
    return data
  },

  // Special actions
  async sync(): Promise<void> {
    const { data } = await http.post("/api/yg-employees/sync")
    return data
  },
}

export default ygEmployeesApi
