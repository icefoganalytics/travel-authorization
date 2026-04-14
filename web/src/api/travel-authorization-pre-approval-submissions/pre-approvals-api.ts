import http from "@/api/http-client"

export const preApprovalsApi = {
  async create(
    travelAuthorizationPreApprovalSubmissionId: number,
    travelAuthorizationPreApprovalId: number
  ): Promise<void> {
    const { data } = await http.post(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/pre-approvals/${travelAuthorizationPreApprovalId}`
    )
    return data
  },
  async delete(
    travelAuthorizationPreApprovalSubmissionId: number,
    travelAuthorizationPreApprovalId: number
  ): Promise<void> {
    const { data } = await http.delete(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/pre-approvals/${travelAuthorizationPreApprovalId}`
    )
    return data
  },
}

export default preApprovalsApi
