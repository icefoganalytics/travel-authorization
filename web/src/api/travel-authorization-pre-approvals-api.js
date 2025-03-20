import http from "@/api/http-client"

/** Keep in sync with api/src/models/travel-authorization-pre-approval.ts */
export const TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  DECLINED: "declined",
})

export const travelAuthorizationPreApprovalsApi = {
  STATUSES: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
  async list({ where, ...otherParams } = {}) {
    const { data } = await http.get("/api/travel-authorization-pre-approvals", {
      params: { where, ...otherParams },
    })
    return data
  },
}

export default travelAuthorizationPreApprovalsApi
