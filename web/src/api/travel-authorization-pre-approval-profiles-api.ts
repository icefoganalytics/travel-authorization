import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export type TravelAuthorizationPreApprovalProfile = {
  id: number
  preApprovalId: number
  profileName: string
  department: string
  branch: string | null
  createdAt: string
  updatedAt: string
}

export type TravelAuthorizationPreApprovalProfileAsIndex = TravelAuthorizationPreApprovalProfile

export type TravelAuthorizationPreApprovalProfileAsShow = TravelAuthorizationPreApprovalProfile & {
  preApproval?: {
    id: number
    purpose: string
    month: number
    travelAdvance: number | null
    eventName: string | null
    summary: string | null
    createdAt: string
    updatedAt: string
  }
}

export type TravelAuthorizationPreApprovalProfileWhereOptions = WhereOptions<
  TravelAuthorizationPreApprovalProfile,
  "id" | "preApprovalId" | "profileName" | "department" | "branch"
>

/** must match model scopes */
export type TravelAuthorizationPreApprovalProfileFiltersOptions = FiltersOptions<{
  approved: true
  openDateOrBeforeStartDate: true
  search: string
}>

export type TravelAuthorizationPreApprovalProfilesQueryOptions = QueryOptions<
  TravelAuthorizationPreApprovalProfileWhereOptions,
  TravelAuthorizationPreApprovalProfileFiltersOptions
>

export const travelAuthorizationPreApprovalProfilesApi = {
  async list(params: TravelAuthorizationPreApprovalProfilesQueryOptions = {}): Promise<{
    travelAuthorizationPreApprovalProfiles: TravelAuthorizationPreApprovalProfileAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-authorization-pre-approval-profiles", {
      params,
    })
    return data
  },

  async get(travelAuthorizationPreApprovalProfileId: number): Promise<{
    travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfileAsShow
    policy: Policy
  }> {
    const { data } = await http.get(
      `/api/travel-authorization-pre-approval-profiles/${travelAuthorizationPreApprovalProfileId}`
    )
    return data
  },

  async create(attributes: Partial<TravelAuthorizationPreApprovalProfile>): Promise<{
    travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile
  }> {
    const { data } = await http.post("/api/travel-authorization-pre-approval-profiles", attributes)
    return data
  },

  async update(
    travelAuthorizationPreApprovalProfileId: number,
    attributes: Partial<TravelAuthorizationPreApprovalProfile>
  ): Promise<{
    travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfileAsShow
    policy: Policy
  }> {
    const { data } = await http.patch(
      `/api/travel-authorization-pre-approval-profiles/${travelAuthorizationPreApprovalProfileId}`,
      attributes
    )
    return data
  },

  async delete(travelAuthorizationPreApprovalProfileId: number): Promise<void> {
    await http.delete(
      `/api/travel-authorization-pre-approval-profiles/${travelAuthorizationPreApprovalProfileId}`
    )
  },
}

export default travelAuthorizationPreApprovalProfilesApi
