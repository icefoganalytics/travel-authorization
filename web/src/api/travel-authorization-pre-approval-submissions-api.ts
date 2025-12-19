import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-authorization-pre-approval-submission.ts */
export enum TravelAuthorizationPreApprovalSubmissionStatuses {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  FINISHED = "finished",
}

/** @deprecated - prefer enum equivalent `TravelAuthorizationPreApprovalSubmissionStatuses` */
export const TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  FINISHED: "finished",
})

/** Keep in sync with api/src/models/travel-authorization-pre-approval-submission.ts */
export type TravelAuthorizationPreApprovalSubmission = {
  id: number
  creatorId: number
  approverId: number | null
  approvedAt: string | null
  status: TravelAuthorizationPreApprovalSubmissionStatuses
  department: string
  createdAt: string
  updatedAt: string
}

export type TravelAuthorizationPreApprovalSubmissionWhereOptions = WhereOptions<
  TravelAuthorizationPreApprovalSubmission,
  "id" | "creatorId" | "approverId" | "status" | "department"
>

/** must match model scopes */
export type TravelAuthorizationPreApprovalSubmissionFiltersOptions = FiltersOptions<
  Record<never, never>
>

export type TravelAuthorizationPreApprovalSubmissionsQueryOptions = QueryOptions<
  TravelAuthorizationPreApprovalSubmissionWhereOptions,
  TravelAuthorizationPreApprovalSubmissionFiltersOptions
>

export const travelAuthorizationPreApprovalSubmissionsApi = {
  STATUSES: TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,

  async list(params: TravelAuthorizationPreApprovalSubmissionsQueryOptions = {}): Promise<{
    travelAuthorizationPreApprovalSubmissions: TravelAuthorizationPreApprovalSubmission[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-authorization-pre-approval-submissions", {
      params,
    })
    return data
  },

  async get(travelAuthorizationPreApprovalSubmissionId: number): Promise<{
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission
    policy: Policy
  }> {
    const { data } = await http.get(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}`
    )
    return data
  },

  async create(attributes: Partial<TravelAuthorizationPreApprovalSubmission>): Promise<{
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission
  }> {
    const { data } = await http.post(
      "/api/travel-authorization-pre-approval-submissions",
      attributes
    )
    return data
  },

  async update(
    travelAuthorizationPreApprovalSubmissionId: number,
    attributes: Partial<TravelAuthorizationPreApprovalSubmission>
  ): Promise<{
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission
    policy: Policy
  }> {
    const { data } = await http.patch(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}`,
      attributes
    )
    return data
  },

  async delete(travelAuthorizationPreApprovalSubmissionId: number): Promise<void> {
    await http.delete(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}`
    )
  },

  // Stateful actions
  async approve(
    travelAuthorizationPreApprovalSubmissionId: number,
    attributes: FormData
  ): Promise<{
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission
    policy: Policy
  }> {
    const { data } = await http.post(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/approve`,
      attributes,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return data
  },
  async submit(
    travelAuthorizationPreApprovalSubmissionId: number,
    attributes: Partial<TravelAuthorizationPreApprovalSubmission>
  ): Promise<{
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission
  }> {
    const { data } = await http.post(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/submit`,
      attributes
    )
    return data
  },
  async revertToDraft(travelAuthorizationPreApprovalSubmissionId: number): Promise<{
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission
  }> {
    const { data } = await http.post(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/revert-to-draft`
    )
    return data
  },
}

export default travelAuthorizationPreApprovalSubmissionsApi
