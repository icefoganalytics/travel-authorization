import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
import type { TravelAuthorizationPreApprovalProfile } from "@/api/travel-authorization-pre-approval-profiles-api"
import type { TravelAuthorizationPreApprovalSubmission } from "@/api/travel-authorization-pre-approval-submissions-api"

/** Keep in sync with api/src/models/travel-authorization-pre-approval.ts */
export enum TravelAuthorizationPreApprovalStatuses {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  DECLINED = "declined",
}

/** @deprecated - prefer enum equivalent `TravelAuthorizationPreApprovalStatuses` */
export const TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  DECLINED: "declined",
})

/** Keep in sync with api/src/models/travel-authorization-pre-approval.ts */
export type TravelAuthorizationPreApproval = {
  id: number
  submissionId: number | null
  estimatedCost: number
  location: string
  department: string | null
  branch: string | null
  purpose: string | null
  reason: string | null
  startDate: string | null
  endDate: string | null
  isOpenForAnyDate: boolean
  month: string | null
  isOpenForAnyTraveler: boolean
  numberTravelers: number | null
  travelerNotes: string | null
  status: TravelAuthorizationPreApprovalStatuses
  createdAt: string
  updatedAt: string
}

export type TravelAuthorizationPreApprovalAsIndex = TravelAuthorizationPreApproval

export type TravelAuthorizationPreApprovalAsShow = TravelAuthorizationPreApproval & {
  submission?: TravelAuthorizationPreApprovalSubmission
}

export type TravelAuthorizationPreApprovalWhereOptions = WhereOptions<
  TravelAuthorizationPreApproval,
  | "id"
  | "submissionId"
  | "location"
  | "department"
  | "branch"
  | "startDate"
  | "endDate"
  | "isOpenForAnyDate"
  | "month"
  | "isOpenForAnyTraveler"
  | "numberTravelers"
  | "status"
>

/** must match model scopes */
export type TravelAuthorizationPreApprovalFiltersOptions = FiltersOptions<{
  availableForSubmission: true
}>

export type TravelAuthorizationPreApprovalsQueryOptions = QueryOptions<
  TravelAuthorizationPreApprovalWhereOptions,
  TravelAuthorizationPreApprovalFiltersOptions
>

export const travelAuthorizationPreApprovalsApi = {
  STATUSES: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,

  async list(params: TravelAuthorizationPreApprovalsQueryOptions = {}): Promise<{
    travelAuthorizationPreApprovals: TravelAuthorizationPreApprovalAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-authorization-pre-approvals", {
      params,
    })
    return data
  },

  async get(travelAuthorizationPreApprovalId: number): Promise<{
    travelAuthorizationPreApproval: TravelAuthorizationPreApprovalAsShow
    policy: Policy
  }> {
    const { data } = await http.get(
      `/api/travel-authorization-pre-approvals/${travelAuthorizationPreApprovalId}`
    )
    return data
  },

  async create(
    attributes: Partial<TravelAuthorizationPreApproval> & {
      profilesAttributes: Partial<TravelAuthorizationPreApprovalProfile>[]
    }
  ): Promise<{
    travelAuthorizationPreApproval: TravelAuthorizationPreApproval
  }> {
    const { data } = await http.post("/api/travel-authorization-pre-approvals", attributes)
    return data
  },

  async update(
    travelAuthorizationPreApprovalId: number,
    attributes: Partial<TravelAuthorizationPreApproval>
  ): Promise<{
    travelAuthorizationPreApproval: TravelAuthorizationPreApproval
  }> {
    const { data } = await http.patch(
      `/api/travel-authorization-pre-approvals/${travelAuthorizationPreApprovalId}`,
      attributes
    )
    return data
  },

  async delete(travelAuthorizationPreApprovalId: number): Promise<void> {
    await http.delete(`/api/travel-authorization-pre-approvals/${travelAuthorizationPreApprovalId}`)
  },
}

export default travelAuthorizationPreApprovalsApi
